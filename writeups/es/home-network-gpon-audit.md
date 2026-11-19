> **Nota de alcance y ética:** Todo lo descrito aquí se hizo sobre **mi propia red doméstica y mis propios equipos**, con fines de aprendizaje. Escanear o atacar redes ajenas sin permiso es ilegal. Los datos sensibles (contraseñas, direcciones MAC completas, SSID reales) están **redactados** a propósito.

## Resumen

Lo que empezó como un `nmap` de curiosidad terminó en un recorrido completo de reconocimiento: descubrir hosts, identificar dispositivos por su fabricante, enumerar servicios, encontrar una fuga de información pre-autenticación en el router del ISP, investigar una CVE crítica de ese modelo exacto, e intentar reproducir la contraseña WiFi de fábrica. Spoiler: el router resultó tener firmware personalizado por el ISP, lo que lo salva del PoC público… pero abre otra madriguera.

**Stack usado:** Parrot Linux, `nmap`, `curl`, `grep`, `nmcli`, Python.

---

## Fase 1 — Descubrimiento de hosts

Primero, ¿quién está vivo en la red?

```bash
sudo nmap -sn 192.168.100.0/24
```

`-sn` hace un *ping scan*: no escanea puertos, solo detecta qué direcciones responden. Salieron ~12 hosts. Lo útil: `nmap` muestra el **fabricante** deducido del prefijo de la MAC (el OUI), lo que ya permite intuir qué es cada aparato.

| IP (ej.) | OUI / Fabricante | Hipótesis |
|---|---|---|
| `.1` | Fiberhome | Router / ONT del ISP |
| `.2` | Chamberlain Group | Abridor de cochera inteligente (IoT) |
| `.5` | Roku | Streaming |
| `.10` | AzureWave | Módulo WiFi (¿laptop/PC?) |
| `.12` | Qingdao Electronics | Dispositivo IoT barato |
| `.14`, `.15` | Apple, Honor | Teléfonos |
| varios | MAC aleatoria | Teléfonos con privacidad de MAC activada |

**Lección:** el OUI de la MAC es inteligencia gratis. Antes de tocar un puerto ya sabes a qué te enfrentas.

---

## Fase 2 — Enumeración de puertos

Escaneo de puertos por host, por ejemplo:

```bash
nmap -Pn 192.168.100.10
```

`-Pn` asume que el host está vivo y se salta el ping (útil cuando un firewall bloquea el ping pero el equipo responde). Hallazgos destacados:

- **PC con Windows (`.10`):** puertos `135` (msrpc) y `445` (microsoft-ds) → huella clásica de Windows/SMB. 997 puertos *filtered* → firewall activo.
- **Dispositivo Google Cast (`.12`):** puertos `8008`/`8009`/`8443` → firma de un Chromecast o TV con Cast.
- **Roku (`.5`):** puerto `7000` → AirPlay.
- **Mi propia máquina (`.16`):** puerto `3000` → un servidor de desarrollo corriendo, visible a toda la LAN.
- **Teléfonos:** todo cerrado/filtrado. Equipos bien blindados.

**Lección:** el nombre del servicio que imprime `nmap` es solo una adivinanza por número de puerto. Para confirmar, `-sV`.

---

## Fase 3 — El equipo bien hecho (PC Windows)

Me metí a fondo con el SMB del `.10` para ver si era vulnerable a la familia EternalBlue.

```bash
sudo nmap -p445 --script smb-protocols 192.168.100.10
```

Resultado: dialectos `2.0.2` → `3.1.1`. **Sin SMBv1.** Eso lo hace inmune a EternalBlue/WannaCry (que requieren SMBv1).

```bash
sudo nmap -p445 --script smb2-security-mode 192.168.100.10
```

Resultado: *"Message signing enabled and required"* → la firma de mensajes es obligatoria, lo que bloquea ataques de relay/MITM sobre SMB. Firma obligatoria es más propio de un equipo endurecido o unido a dominio que de una laptop casera.

**Lección:** encontrar un equipo bien configurado es un hallazgo tan válido como encontrar un agujero. Aprender a reconocer lo sólido es la otra mitad del trabajo.

---

## Fase 4 — El router: el objetivo jugoso

El `.1` (Fiberhome) solo tenía abierto el puerto `80` (HTTP, **sin HTTPS**).

```bash
sudo nmap -sV 192.168.100.1
```

Resultado: `nginx (reverse proxy)` **sin versión expuesta**. Un reverse proxy es un intermediario puesto *delante* del servidor real: recibe las peticiones y las reparte hacia atrás, ocultando lo que hay detrás.

### Cabeceras HTTP

```bash
sudo nmap -p80 --script http-headers 192.168.100.1
```

Sorpresa: el router traía un paquete completo de cabeceras defensivas (`X-Frame-Options`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection`, `Referrer-Policy`, etc.) y **sin** cabecera `Server` con versión. Más endurecido de lo típico en un router de ISP.

### La página de login: un despachador JS

```bash
curl http://192.168.100.1
```

El HTML no tenía `<title>` porque era un **despachador en JavaScript**: al cargar llamaba a `frmLoad()`, que consultaba el modelo y el operador y redirigía al login correspondiente. Entre decenas de operadores del mundo apareció:

```javascript
if (data.operator_name == "MEX_NETWEY") {
    url = "html/login_mex_netwey.html";
}
```

→ confirmación del contexto del ISP. También `charset=gbk` (codificación china → firmware Fiberhome sin traducir del todo).

### Fuga de información pre-autenticación

La página consultaba `get_device_name` y `get_operator` **antes de pedir login**. Leyendo cómo se construían esas peticiones:

```bash
curl -s http://192.168.100.1/js/xhr.js -o xhr.js
grep -n "open" xhr.js
```

En `xhr.js` estaba la clave:

- Endpoint real: `../cgi-bin/ajax`
- El "método" se pasa como parámetro: `ajaxmethod=<nombre>`

Pidiendo `/get_device_name` directo daba `400 Bad Request` (ruta equivocada). Con la estructura correcta:

```bash
curl -s "http://192.168.100.1/cgi-bin/ajax?ajaxmethod=get_device_name&_=1"
```

Respuesta **sin autenticación**:

```json
{"sessionid":"[REDACTED]","session_valid":1,"ModelName":"HG6145F1"}
```

→ **Fuga de información (info disclosure):** el router revela su modelo exacto, `HG6145F1`, antes de pedir contraseña. Severidad baja por sí sola, pero es la pieza que un atacante quiere primero. (El `sessionid`/`session_valid` es un token de sesión anónima que el firmware reparte a cualquiera para el flujo de login, no una sesión autenticada.)

> **Bonus:** el `xhr.js` contenía JavaScript ofuscado con rutinas de **detección de herramientas de desarrollo** (anti-tampering). El firmware intenta darse cuenta si lo inspeccionan desde el navegador.

Intentar sacar la versión del firmware falló: `get_version` y `get_device_info` devolvían `{}` vacío → **ese dato sí está protegido tras login**. Fuga del modelo sí, de la versión no. Comportamiento correcto donde más importa.

---

## Fase 5 — Investigación de vulnerabilidades

Con el modelo exacto (`HG6145F1`), a buscar qué hay documentado.

### CVE-2025-63353 (crítica, 9.8)

El HG6145F1 **genera su contraseña WiFi de fábrica con un algoritmo determinista derivado del SSID**. Como el SSID se transmite abierto, cualquiera dentro del rango puede predecir la contraseña por defecto, sin autenticación. PoC público disponible, sin parche del fabricante.

### Historial de la familia Fiberhome

En 2021, Pierre Kim documentó **~28 cuentas backdoor** y múltiples vulnerabilidades en ONTs Fiberhome (modelos `HG6245D`, `RP2602`), incluido un backdoor para activar Telnet vía una petición HTTPS con la MAC del equipo. *Nota:* confirmado en esos modelos, **no** en el HG6145F1; pero mismo fabricante, código base similar.

---

## Fase 6 — ¿Estoy expuesta?

### Credenciales web

Las credenciales de fábrica documentadas (`user` / `user1234`) **no funcionaron** → el ISP las cambió. ✔️ Vector de default cerrado.

### Extraer mis propias contraseñas WiFi

Como estoy conectada a la red, mi sistema las guarda:

```bash
sudo grep psk /etc/NetworkManager/system-connections/*.nmconnection
```

(`psk` = *Pre-Shared Key*, el nombre técnico de la contraseña WiFi.)

### Análisis de BSSID: dos routers distintos

```bash
nmcli -f IN-USE,BSSID,SSID device wifi list
```

Dato clave: comparando los **BSSID** (la MAC de cada antena), descubrí que mis dos redes de casa salen de **routers físicamente distintos**:

| Red (sanitizada) | OUI del BSSID | Equipo |
|---|---|---|
| `Totalplay-...-XXXX` | `64:9D:F3` (Fiberhome) | Mi router principal (el escaneado) |
| `Totalplay-YYYY` | `F4:FB:B8` (otro fabricante) | Segundo router / repetidor de casa |

(Tenemos dos porque a la planta de arriba no llega bien la señal.)

### Estructura de la contraseña de fábrica

La contraseña del segundo router tenía una forma reveladora:

```
<token-del-SSID> + <cola-de-la-MAC> + <8 caracteres opacos>
```

Los dos primeros pedazos son **públicos** (nombre de red + MAC, ambos transmitidos al aire). Solo los últimos 8 caracteres son "secreto" real.

**Lección:** una contraseña que incrusta datos públicos no es un secreto. Ese es exactamente el patrón que explota la CVE.

---

## Fase 7 — Intentar reproducir la contraseña

El PoC/writeup de la CVE describe el algoritmo para los HG6145F1 "vainilla":

- SSID = `fh_<HexA>`
- Contraseña = `wlan<HexB>`, donde **`HexB = 0xFFFFFF − HexA`**

La parte elegante: restar a `0xFFFFFF` es complementar **cada dígito hex contra `F`**, a mano:

```
F−1=E  F−2=D  F−3=C  F−4=B  F−5=A  F−6=9
123456  →  EDCBA9      (SSID fh_123456  →  pass wlanedcba9)
```

Lo probé contra mis datos en Python:

```python
hex(0xFFFFFF - 0x0AAD)   # -> '0xfff552'
```

**No coincidía** con el token de mi contraseña → hipótesis rechazada.

### Conclusión del experimento

Mis routers **no usan el esquema `fh_`/`wlan`**. Sus SSID son `Totalplay-...` y las contraseñas no llevan prefijo `wlan` ni estructura hex compatible. Es decir: **el ISP personalizó el firmware**, con su propia marca y su propio esquema de contraseñas. El PoC público no puede "comerse" mi SSID.

→ **Hallazgo:** la CVE-2025-63353 golpea a los HG6145F1 con firmware de fábrica; las unidades personalizadas por un ISP usan un esquema **no documentado públicamente**. Saber si el de mi ISP también es predecible requeriría reversear *su* firmware.

---

## Fase 8 — El muro del firmware

Para reversear el esquema real necesitaría la imagen del firmware:

```bash
binwalk -e firmware.bin   # extrae el sistema de archivos del router
```

Pero **el firmware del HG6145F1 no está disponible para descargar**. Las opciones:

1. Leer el PoC público (solo aplica al esquema vainilla, no al mío).
2. Practicar `binwalk`/RE con firmware descargable (OpenWrt, etc.).
3. **Dumpear el firmware del propio equipo por UART** (puerto serial en la placa) → proyecto de hardware pendiente (adaptador USB-TTL de 3.3V, identificar pines TX/RX/GND con multímetro, volcar las particiones `mtd`). Esta es la vía "de verdad" para mi unidad en concreto.

---

## Conclusiones

1. **El OUI de la MAC es reconocimiento gratuito.** Identifica fabricantes antes de tocar un puerto.
2. **Lo bien configurado también es un hallazgo.** El Windows y el router estaban más endurecidos de lo esperado.
3. **Las fugas pre-autenticación importan:** el modelo filtrado dio el pie para encontrar una CVE crítica específica.
4. **Las contraseñas de fábrica derivadas de datos públicos no son secretas** — principio central de la CVE-2025-63353.
5. **El firmware personalizado por el ISP cambia el juego:** un PoC público puede no aplicar a tu unidad exacta.
6. **La línea ética no es "¿puedo?", es "¿tengo permiso sobre este equipo?"** Todo esto fue sobre equipo propio.

## Remediación

- Cambiar la contraseña y el nombre del WiFi de ambos routers (por una que **no** se derive del SSID), vía la app/soporte del ISP, ya que el panel está bloqueado.
- Verificar que la administración remota esté desactivada.
- Pedir al ISP una actualización de firmware, citando la CVE-2025-63353.

## Referencias

- CVE-2025-63353 — FiberHome GPON ONU HG6145F1 Predictable Default Wi-Fi Password.
- Pierre Kim (2021) — *Multiple vulnerabilities found in FiberHome HG6245D routers* (backdoors en ONTs Fiberhome).
