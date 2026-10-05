# Chapter 48 — Linux Command Line for Beginners

> **Foundations module.** Every AWS lab, EC2 instance, container, and CI pipeline assumes you can drive a Linux shell. This chapter is the prerequisite for everything else in the course.

**Companion video:** Linux Command Line for Beginners — Keep On Coding — https://www.youtube.com/watch?v=16d2lHc0Pe8

---

## 1. Why the Command Line

- ~90% of public cloud workloads run on Linux. EC2, Lambda runtimes, Docker images, EKS nodes — Linux underneath.
- The console is a convenience; the CLI is the craft. GUIs can't automate, pipe, or SSH.
- Debugging production = reading logs and checking processes from a terminal.
- Interviews test it: "find all files modified in the last 24h", "what's using port 80?"

**Warning:** the shell never asks "are you sure?" — `rm -rf` deletes permanently. Read before Enter.

---

## 2. The Shell & the Filesystem

```
uday@ip-172-31-8-12:~/projects$ ls
└┬─┘ └────┬───────┘ └───┬────┘ └┬┘
user   hostname      cwd     shell waits here
```

- **Shell** — the program reading commands (`bash`, `zsh`). `$` = normal user, `#` = root.
- **cwd** — current working directory; `~` = home.
- Paths: absolute (`/var/log/syslog`) vs relative (`../images/x.png`). `.` here, `..` parent, `-` previous dir.

### Filesystem map

```
/
├── home/<user>/   ← your stuff (~)
├── etc/           ← config files
├── var/log/       ← logs
├── usr/bin/       ← programs
├── tmp/           ← wiped on reboot
└── opt/, srv/, mnt/
```

### Reflexes

| Key | Action |
|---|---|
| `Tab` | autocomplete |
| `↑`/`↓` | history |
| `Ctrl+C` | kill running command |
| `Ctrl+L` | clear screen |
| `Ctrl+R` | search history |
| `Ctrl+D` | logout |

---

## 3. Navigation

```bash
pwd                    # where am I
ls -la                 # all files, long format
ls -lhS                # sorted by size, human readable
cd /var/log            # absolute
cd .. ; cd - ; cd ~    # up / previous dir / home
```

`cd -` is the sleeper power-move: jumps to wherever you were last.

---

## 4. Files & Directories

```bash
mkdir -p a/b/c          # whole chain at once
touch notes.md          # empty file / refresh timestamp
cp -r src/ backup/      # recursive copy
mv old.txt new.txt      # move AND rename
rm -ri backup/          # interactive delete — the safe habit
cat file  | less file   # dump / page through
head -3 file            # first lines
tail -f /var/log/syslog # live log stream (Ctrl+C to stop)
```

`>` overwrites a file, `>>` appends. Mixing them up has destroyed many configs.

---

## 5. Permissions & Ownership

```
-rwxr-xr-x 1 uday uday 312 deploy.sh
 │└┬┘└┬┘└┬┘   │    │
 │ │  │  └─ others  │    └─ group
 │ │  └──── group   └─ owner
 │ └─────── owner
 └───────── file type (d = dir, - = file, l = link)
```

Octal: read=4, write=2, execute=1 — sum per triplet.

| Mode | Meaning | Use for |
|---|---|---|
| 644 | rw- r-- r-- | normal files |
| 755 | rwx r-x r-x | scripts, dirs |
| 600 | rw- --- --- | secrets, SSH keys |
| 640 | rw- r-- --- | group-readable secrets |

```bash
chmod +x deploy.sh        # make runnable → ./deploy.sh
chmod 600 ~/.ssh/id_rsa   # ssh REFUSES loose keys
sudo chown root:adm f     # change owner:group
```

---

## 6. Search, Pipes & Redirection

```bash
grep -rn "ERROR" /var/log/      # recursive, with line numbers
grep -rn "ERROR" /var/log/ | wc -l   # count matches
find /var/log -name "*.log" -mtime -1  # modified last 24h
history | tail -20
```

Pipes (`|`) chain stdout→stdin — small tools compose into one-liners. `>` write file, `>>` append, `2>` stderr, `&>` both.

---

## 7. Processes & System Vitals

```bash
ps aux | grep python   # find a process
kill <PID>             # polite stop (SIGTERM)
kill -9 <PID>          # unstoppable (SIGKILL) — last resort
df -h                  # disk usage
free -m                # memory in MB
uptime                 # load averages (1/5/15 min)
top                    # live process monitor
```

"Server feels slow" reflexes: `df -h`, `free -m`, `uptime`, `top`.

---

## 8. Errors You'll Actually Hit

| Error | Cause | Fix |
|---|---|---|
| `command not found` | typo / not installed | `which cmd`; `sudo apt install pkg` |
| `Permission denied` | missing x bit / rights | `ls -l` → `chmod +x`; sudo for system paths |
| `No such file or directory` | wrong path / case | `pwd` first; Linux is case-sensitive |
| `not in sudoers` | no admin rights | get added to sudo group |
| hung command | `tail -f` / long job | `Ctrl+C` (or `Ctrl+Z` → `kill %1`) |

---

# 🔬 Practical Lab — Your First Hour in a Linux Shell

Run on WSL (Windows), Terminal.app (macOS), or a free-tier EC2 Amazon Linux box — same commands everywhere.

### Step 1 — Get your bearings
```bash
pwd && whoami && ls -la
```
Expected: your home path (e.g. `/home/uday`), your username, directories marked with leading `d`.

### Step 2 — Build a workspace
```bash
mkdir -p ~/practice/aws && cd ~/practice/aws && touch notes.md commands.log
```

### Step 3 — Write & read without an editor
```bash
echo "Today I learned the CLI" > notes.md
echo "and survived" >> notes.md
cat notes.md
```

### Step 4 — Make a runnable script
```bash
echo "echo Deploying to production" > deploy.sh
chmod +x deploy.sh && ./deploy.sh
```

### Step 5 — Hunt through output
```bash
ls -la /etc | grep conf | head -10
history | tail -20
```

### Step 6 — System vitals
```bash
df -h && free -m && uptime
```
Record: disk %, free memory, load averages.

### Step 7 — Clean up safely
```bash
rm -ri ~/practice
```
Confirm each prompt. `rm -i` = training wheels worth keeping.

### Cleanup
Nothing persists outside `~/practice`, already deleted in Step 7.
