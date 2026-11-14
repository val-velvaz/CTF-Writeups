<!--
  PLANTILLA DE WRITEUP
  1. Copia este archivo a  writeups/<idioma>/<slug>.md   (idioma: en, es o de;
     slug: minúsculas, números y guiones; igual en todas las traducciones)
  2. Añade su entrada en  writeups/index.json  (ver README) y el idioma en "idiomas"
  3. Borra este comentario. (No se muestra, pero mejor dejarlo limpio.)

  Sintaxis soportada:
    ## Sección          ### Subsección
    **negrita**  *cursiva*  `comando`
    ```  bloque de código  ```   (las líneas que empiezan por # salen como comentario)
    - listas  /  1. listas numeradas
    > nota / cita
    [enlace](https://...)     ![captura](img/<slug>/paso1.png)
    ==bandera==               → resaltada como flag
-->
Breve introducción: qué máquina es, qué se aprende.

## 1 · Reconocimiento

```
# escaneo inicial
nmap -sC -sV -oN nmap.txt <IP>
```

Puertos abiertos y qué servicios corren.

## 2 · Enumeración

## 3 · Acceso inicial

## 4 · Escalada de privilegios

Bandera: ==...==

## Lección defensiva

Qué estaba mal configurado y cómo se arreglaría en un sistema real.
