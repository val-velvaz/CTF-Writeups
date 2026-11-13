Primera máquina de Starting Point. El objetivo es entender el flujo básico: escanear, encontrar un servicio y aprovechar una mala configuración.

## 1 · Reconocimiento

Tras conectar la VPN, escaneo los puertos de la máquina:

```
# descubrir puertos y versiones
nmap -sV 10.129.207.57
```

Solo hay un puerto abierto: el `23/telnet`. Un servicio antiguo y sin cifrado.

## 2 · Acceso

Me conecto por telnet. La máquina está mal configurada y acepta la cuenta de administrador sin contraseña:

```
telnet 10.129.207.57
# login: root   (contraseña: vacía → Enter)
```

Entro directo como `root`. Confirmo y busco la bandera:

```
whoami
# root
ls
cat flag.txt
```

Bandera: ==b40abdfe23665f766f9c61ecba8a4c19==

## Lección defensiva

Telnet manda todo en texto plano y aquí había una cuenta **root sin contraseña**. En un sistema real: usar SSH en vez de telnet, y jamás dejar cuentas sin contraseña. Exponer lo mínimo.
