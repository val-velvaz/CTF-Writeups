<!--
  WRITEUP TEMPLATE
  1. Copy this file to  writeups/<lang>/<slug>.md   (lang: en, es or de;
     slug: lowercase letters, numbers and hyphens; same across all translations)
  2. Add its entry to  writeups/index.json  (see README) and the language to "languages"
  3. Delete this comment. (It isn't rendered, but it's cleaner without it.)

  Supported syntax:
    # Part   ## Section   ### Subsection   #### Detail   (each level has its own color)
    **bold**  *italic*  `command`
    ```  code block  ```   (lines starting with # are shown as comments)
    - lists  /  1. numbered lists
    > note / quote
    | Col A | Col B |   ← table: header row, then |---|---|, then one row per line
    |---|---|
    [link](https://...)     ![screenshot](img/<slug>/step1.png)
    ==flag==                → highlighted as a flag
-->
Short introduction: what machine this is and what it teaches.

## 1 · Reconnaissance

```
# initial scan
nmap -sC -sV -oN nmap.txt <IP>
```

Open ports and the services running on them.

## 2 · Enumeration

## 3 · Initial access

## 4 · Privilege escalation

Flag: ==...==

## Defensive takeaway

What was misconfigured and how it would be fixed on a real system.
