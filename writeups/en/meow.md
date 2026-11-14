First machine made out from Starting Point. The objective is to understand the basic flow: scan, find a service and take advantage of a bad configuration.

## 1. Recognition
After connecting the VPN, I proceed to scan the machines ports:
```
# find ports and their versions
nmap -sV 10.129.207.57
```
There is only one open port: `23/telnet`. An old and unencrypted service.

### What is `telnet`?

