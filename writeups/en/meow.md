First machine made out from Starting Point. The objective is to understand the basic flow: scan, find a service and take advantage of a bad configuration.

## 1. Recognition
After connecting the VPN, I proceed to scan the machines ports:
```
# find ports and their versions
nmap -sV -sC 10.129.214.47
```bash
I'm performing a scan with the ==nmap== tool. It provides several number of features for probing computer networks. Within this, I've decided to use the `-sV`command, this command is useful whenever we want to determine the version of the service running on port. On the other hand, `-sC` is useful whenever we want to identify what is running on open ports, it scans with default ==NSE== scripts.

The output is the following:
```
➜  ~ nmap -sV -sC 10.129.214.47
Starting Nmap 7.98 ( https://nmap.org ) at 2026-11-15 17:33 -0600
Nmap scan report for 10.129.214.47
Host is up (0.070s latency).
Not shown: 999 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
23/tcp open  telnet  Linux telnetd
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 26.64 seconds
```

There is only one open port: `23/telnet`. An old and unencrypted service.

### What is `telnet`?
**Telnet** stands for ==Teletype Network==. It is a **client/server application protocol** that provides access to virtual terminals of remote systems on local area networks or the internet, in oder words, it allows you to connect to another local computer.

It was originally designed to be a simple and secure method of connecting to a remote system, specifically a *mainframe*. Nevertheless, it's used has diminished due to security concerns, and new alternatives such as ==SSH== are now preferred over Telnet.


