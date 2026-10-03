/**
 * ============================================================
 * MODULE 48 — Linux Command Line for Beginners
 * Foundations module: shell, navigation, files, permissions,
 * pipes & processes — the CLI skills every AWS lab assumes.
 * Video: "Linux Command Line for Beginners" (Keep On Coding)
 * ============================================================
 */
const MODULE_48_DATA = {
  id: 'linux-cli-fundamentals',
  moduleId: 'module-48',
  title: 'Linux Command Line for Beginners',
  description: 'Every AWS lab, EC2 instance, and container starts with a terminal. Master the shell: navigate the filesystem, manage files, control permissions, chain commands with pipes, and debug like a pro — the foundation every later module builds on.',
  difficulty: 'beginner',
  duration: '60 min',
  prerequisites: [],
  objectives: [
    'Navigate the Linux filesystem with pwd, ls, and cd',
    'Create, copy, move, and delete files and directories',
    'Read files with cat, less, head, and tail',
    'Understand and modify permissions with chmod',
    'Search content with grep and find files with find',
    'Chain commands using pipes and redirection',
    'Inspect and manage running processes'
  ],

  sections: [
    {
      id: 'watch-video',
      type: 'video',
      title: 'Watch: Linux Command Line for Beginners',
      content: {
        videoId: '16d2lHc0Pe8',
        title: 'Linux Command Line for Beginners — Keep On Coding',
        caption: 'Full beginner walkthrough (~40 min). Follow along in the simulated terminal below — then practice on a real machine or a free-tier EC2 instance.'
      }
    },

    {
      id: 'why-linux-cli',
      type: 'why',
      title: 'Why the Command Line?',
      content: {
        html: `
          <div class="alert alert-info">
            <span class="alert-icon">🐧</span>
            <div class="alert-content">
              <div class="alert-title">The terminal is where cloud work actually happens</div>
              <div class="alert-text">Over 90% of public cloud workloads run on Linux. EC2 instances, Docker containers, Lambda runtimes, and EKS nodes are all Linux underneath. The AWS console is a convenience — the CLI is the craft.</div>
            </div>
          </div>
          <h4>What you can do from a shell that a GUI can't</h4>
          <ul>
            <li><strong>Automate</strong> — turn 200 clicks into a 3-line script</li>
            <li><strong>SSH into servers</strong> — there is no GUI on a production box</li>
            <li><strong>Debug live systems</strong> — tail logs, check processes, trace errors in real time</li>
            <li><strong>Chain tools</strong> — pipes turn simple commands into powerful one-liners</li>
            <li><strong>Pass interviews</strong> — "how do you find all files modified in the last 24h?" is a classic</li>
          </ul>
          <div class="alert alert-warning">
            <span class="alert-icon">⚠️</span>
            <div class="alert-content">
              <div class="alert-title">The shell does not ask "are you sure?"</div>
              <div class="alert-text"><code>rm -rf</code> deletes immediately and permanently — no recycle bin, no undo. Precision is a habit: read a command before you press Enter.</div>
            </div>
          </div>
        `
      }
    },

    {
      id: 'shell-concepts',
      type: 'concept',
      title: 'The Shell & the Filesystem',
      content: {
        html: `
          <h4>The prompt, decoded</h4>
          <pre>uday@ip-172-31-8-12:~/projects$ ls
└┬─┘ └────┬───────┘ └───┬────┘ └┬┘
user   hostname      cwd     shell waits here</pre>
          <ul>
            <li><strong>Shell</strong> — the program reading your commands (usually <code>bash</code> or <code>zsh</code>)</li>
            <li><strong>cwd</strong> — current working directory; <code>~</code> is your home directory</li>
            <li><strong>$</strong> — normal user prompt; <code>#</code> means root (be careful)</li>
          </ul>
          <h4>The filesystem tree</h4>
          <pre>/
├── home/uday/          ← your stuff lives here (~)
├── etc/                ← config files (nginx.conf, sshd_config)
├── var/log/            ← logs you'll tail forever
├── usr/bin/            ← installed programs
├── tmp/                ← wiped on reboot
└── opt/, srv/, mnt/    ← apps, services, mounts</pre>
          <p>Everything starts at <code>/</code> (root). Paths are either <strong>absolute</strong> (<code>/var/log/syslog</code>) or <strong>relative</strong> to where you stand (<code>../images/logo.png</code>). Special shortcuts: <code>.</code> = here, <code>..</code> = parent, <code>-</code> = previous directory, <code>~</code> = home.</p>
          <h4>Essential reflexes</h4>
          <table>
            <thead><tr><th>Key</th><th>Does what</th></tr></thead>
            <tbody>
              <tr><td><code>Tab</code></td><td>Autocomplete paths & commands — never type whole filenames</td></tr>
              <tr><td><code>↑</code> / <code>↓</code></td><td>Scroll command history</td></tr>
              <tr><td><code>Ctrl+C</code></td><td>Kill the running command</td></tr>
              <tr><td><code>Ctrl+L</code> or <code>clear</code></td><td>Clear the screen</td></tr>
              <tr><td><code>Ctrl+R</code></td><td>Search backwards through history</td></tr>
              <tr><td><code>Ctrl+D</code> or <code>exit</code></td><td>Close the shell / log out</td></tr>
            </tbody>
          </table>
        `
      }
    },

    {
      id: 'cmd-navigation',
      type: 'command',
      title: 'Navigation Commands',
      content: [
        {
          command: 'pwd && ls -la && cd /var/log',
          category: 'linux',
          expectedOutput: '/home/uday\ntotal 32\ndrwxr-xr-x  5 uday uday 4096 Jan 12 09:14 .\ndrwxr-xr-x 21 root root 4096 Jan 10 18:02 ..\n-rw-r--r--  1 uday uday  220 Jan 10 18:02 .bashrc\ndrwxr-xr-x  3 uday uday 4096 Jan 12 09:14 projects',
          explanation: 'pwd prints where you are. ls -la lists everything including hidden (.) files with permissions, owner, size, and date. cd changes directory. Chain with && to run left-to-right, stopping on failure.',
          interviewQ: 'What do the letters in drwxr-xr-x actually mean?'
        },
        {
          command: 'cd /var/log && cd - && cd ~/projects/../ && pwd',
          category: 'linux',
          expectedOutput: '/home/uday',
          explanation: 'cd - jumps back to your previous directory (huge time-saver). ~ expands to home. .. goes up one level. Combine them freely in a single path.',
          interviewQ: 'How do you return to the previous directory without typing its path?'
        },
        {
          command: 'ls -lhS /var/log | head -5',
          category: 'linux',
          expectedOutput: '-rw-r----- 1 syslog adm   2.4M Jan 12 10:01 syslog\n-rw-r----- 1 syslog adm   890K Jan 12 09:44 auth.log\n-rw-r----- 1 root   adm   512K Jan 12 08:30 kern.log\n-rw-r----- 1 syslog adm   310K Jan 12 10:01 daemon.log',
          explanation: 'ls -lhS sorts by size with human-readable units — instantly find the file eating your disk. pipe to head to see just the top 5.',
          interviewQ: 'How do you find the largest files in a directory?'
        }
      ]
    },

    {
      id: 'terminal-sandbox',
      type: 'terminal',
      title: 'Try It: Simulated Linux Shell',
      content: {
        title: 'Linux Sandbox — fake filesystem, real commands',
        mode: 'simulated',
        initialText: 'Welcome to the practice shell (simulated).\nTry:  pwd · ls · ls -la · cd projects · cat notes.txt · cd .. · mkdir test · whoami · uname -a · help',
        commands: {
          'pwd': { text: '/home/uday', type: 'output' },
          'ls': { text: 'projects  notes.txt  deploy.sh  .bashrc', type: 'output' },
          'ls -la': { text: 'total 24\ndrwxr-xr-x 4 uday uday 4096 Jan 12 09:14 .\ndrwxr-xr-x 3 root root 4096 Jan 10 18:02 ..\n-rw-r--r-- 1 uday uday  220 Jan 10 18:02 .bashrc\ndrwxr-xr-x 2 uday uday 4096 Jan 12 09:14 projects\n-rw-r--r-- 1 uday uday  148 Jan 12 09:10 notes.txt\n-rwxr-xr-x 1 uday uday  312 Jan 12 09:11 deploy.sh', type: 'output' },
          'cd projects': { text: '', type: 'success' },
          'cd ..': { text: '', type: 'success' },
          'cat notes.txt': { text: 'TODO: finish AWS masterclass\n- launch EC2 (Amazon Linux)\n- practice: chmod, grep, pipes\n- remember: Tab is your friend', type: 'output' },
          'mkdir test': { text: '', type: 'success' },
          'whoami': { text: 'uday', type: 'output' },
          'uname -a': { text: 'Linux ip-172-31-8-12 6.8.0-1012-aws #13-Ubuntu SMP x86_64 GNU/Linux', type: 'output' },
          'echo hello': { text: 'hello', type: 'output' },
          'history': { text: '    1  pwd\n    2  ls -la\n    3  cd projects\n    4  cat notes.txt\n    5  history', type: 'output' },
          'date': { text: 'Mon Jan 12 10:24:31 UTC 2026', type: 'output' },
          'help': { text: 'pwd · ls · ls -la · cd <dir> · cat <file> · mkdir <dir> · whoami · uname -a · echo <text> · history · date · clear', type: 'info' },
          'sudo rm -rf /': { text: 'sudo: nice try. This is a sandbox. 🛡️', type: 'error' }
        }
      }
    },

    {
      id: 'cmd-files',
      type: 'command',
      title: 'Files & Directories',
      content: [
        {
          command: 'mkdir -p projects/aws/labs && touch projects/aws/labs/notes.md',
          category: 'linux',
          expectedOutput: '# creates nested directories, then an empty file',
          explanation: 'mkdir -p creates the whole path chain in one shot. touch creates an empty file (or updates its timestamp if it exists).',
          interviewQ: 'What does mkdir -p do that plain mkdir does not?'
        },
        {
          command: 'cp -r projects backup/ && mv notes.txt projects/ && rm -ri backup/old',
          category: 'linux',
          expectedOutput: 'rm: descend into directory ‘backup/old’? y',
          explanation: 'cp -r copies directories recursively. mv moves AND renames. rm -i asks before deleting — alias rm to rm -i until muscle memory develops. Directories need rm -r.',
          interviewQ: 'Why is rm -rf / dangerous, and does rm have an undo?'
        },
        {
          command: 'cat notes.md | head -3 && tail -f /var/log/syslog',
          category: 'linux',
          expectedOutput: '# prints first 3 lines, then live-streams syslog (Ctrl+C to stop)',
          explanation: 'cat dumps whole files (fine for small ones). head/tail slice beginnings and endings. tail -f follows a log in real time — this is how you watch a deploy or debug a crash.',
          interviewQ: 'How do you watch a log file update live?'
        }
      ]
    },

    {
      id: 'cmd-permissions',
      type: 'command',
      title: 'Permissions & Ownership',
      content: [
        {
          command: 'ls -l deploy.sh && chmod +x deploy.sh && ls -l deploy.sh',
          category: 'linux',
          expectedOutput: '-rw-r--r-- 1 uday uday 312 Jan 12 09:11 deploy.sh\n-rwxr-xr-x 1 uday uday 312 Jan 12 09:11 deploy.sh',
          explanation: 'chmod +x adds execute permission — required before you can run a script as ./deploy.sh. The rwx triplets apply to owner / group / others.',
          interviewQ: 'A script gives "Permission denied" when run. First thing you check?'
        },
        {
          command: 'chmod 640 secrets.env && sudo chown root:adm secrets.env',
          category: 'linux',
          expectedOutput: '# rw- r-- --- → owner can write, group can read, others nothing',
          explanation: 'Octal mode: 4=read, 2=write, 1=execute, summed per triplet (640 = rw-r-----). chown changes owner:group. sudo runs a command as root — use it surgically, not habitually.',
          interviewQ: 'What does chmod 755 do? What about 600 for an SSH key?'
        }
      ]
    },

    {
      id: 'cmd-search-pipes',
      type: 'command',
      title: 'Search, Pipes & Redirection',
      content: [
        {
          command: 'grep -rn "ERROR" /var/log/ | wc -l',
          category: 'linux',
          expectedOutput: '47',
          explanation: 'grep -rn searches recursively with line numbers. The pipe | sends output into wc -l to count matches. This is the debugging bread-and-butter on any server.',
          interviewQ: 'How would you count how many times "timeout" appears in a log?'
        },
        {
          command: 'find /var/log -name "*.log" -mtime -1 -exec ls -lh {} \\;',
          category: 'linux',
          expectedOutput: '-rw-r----- 1 syslog adm 2.4M Jan 12 10:01 /var/log/syslog\n-rw-r----- 1 syslog adm 890K Jan 12 10:01 /var/log/auth.log',
          explanation: 'find locates files by name (-name), age (-mtime -1 = modified in last 24h), size, type. -exec runs a command on each result ({} is the file, \\; ends the exec).',
          interviewQ: 'Find all .log files larger than 100MB modified this week?'
        },
        {
          command: 'ps aux | grep python && df -h / && free -m',
          category: 'linux',
          expectedOutput: 'uday      1842  0.3  1.2  92412 38156 ?  S  09:14  0:02 python3 app.py\n/dev/xvda1  30G  8.1G   21G  29% /\n              total    used    free\nMem:          3892    1120    2772',
          explanation: 'ps aux lists all processes; piping to grep finds one. df -h shows disk usage, free -m memory. These three commands answer "is the server healthy?" in 3 seconds.',
          interviewQ: 'Server feels slow — what 3 commands do you run first?'
        }
      ]
    },

    { id: 'lab', type: 'lab', title: 'Practical Lab: Your First Hour in a Linux Shell', content: {
      title: 'Linux CLI Foundations Lab',
      description: 'Run this on any Linux shell: WSL on Windows, Terminal.app on macOS, or a free-tier EC2 (Amazon Linux) instance — the same commands work everywhere.',
      difficulty: 'beginner',
      steps: [
        { id: 'step-1', title: 'Get your bearings', instruction: 'Run pwd, whoami, and ls -la. Note your home directory path and identify which entries are directories vs files (leading d).', expectedResult: 'You can state your home path (e.g. /home/uday) and spot hidden files starting with .', hint: 'Files beginning with . are hidden — ls needs -a to show them.' },
        { id: 'step-2', title: 'Build a workspace', instruction: 'Run: mkdir -p ~/practice/aws && cd ~/practice/aws && touch notes.md commands.log', expectedResult: 'Directory ~/practice/aws exists containing two empty files.', hint: 'mkdir -p creates missing parent directories automatically.' },
        { id: 'step-3', title: 'Write & read without an editor', instruction: 'Run: echo "Today I learned the CLI" > notes.md then cat notes.md. Then append with: echo "and survived" >> notes.md', expectedResult: 'cat shows both lines — > overwrites, >> appends.', hint: 'A single > replaces the whole file. Double >> adds to the end.' },
        { id: 'step-4', title: 'Make a runnable script', instruction: 'Run: echo "echo Deploying to production" > deploy.sh && chmod +x deploy.sh && ./deploy.sh', expectedResult: 'Script prints "Deploying to production". Before chmod you would get Permission denied.', hint: 'Scripts need the x bit AND a relative path (./) to run.' },
        { id: 'step-5', title: 'Hunt through output', instruction: 'Run: ls -la /etc | grep conf | head -10 — then try: history | tail -20', expectedResult: 'You see only lines containing "conf", and a numbered list of your last 20 commands.', hint: 'grep filters lines; pipes connect any command to any other.' },
        { id: 'step-6', title: 'System vitals', instruction: 'Run: df -h, free -m, and uptime. Record disk %, free memory, and load average.', expectedResult: 'You can read disk usage %, memory in MB, and the 1/5/15-min load averages.', hint: 'Load average above your vCPU count = the machine is saturated.' },
        { id: 'step-7', title: 'Clean up like a pro', instruction: 'Run: rm -ri ~/practice and confirm each prompt, then verify with ls ~', expectedResult: 'The practice tree is gone — interactively, so nothing was lost by accident.', hint: 'rm -i asks before every deletion. The safest habit for beginners.' }
      ] } },

    {
      id: 'troubleshooting',
      type: 'troubleshooting',
      title: 'Common Errors Decoded',
      content: [
        { error: 'command not found', cause: 'Typo, or the tool isn\'t installed / not on $PATH', fix: 'Check spelling. Try which <cmd>. Install it (sudo apt install <pkg>) if missing.' },
        { error: 'Permission denied', cause: 'Missing execute bit on a script, or you lack rights to the file/dir', fix: 'ls -l the file → chmod +x for scripts, or sudo for system paths. Never chmod 777 as a shortcut.' },
        { error: 'No such file or directory', cause: 'Wrong path — you\'re not where you think you are', fix: 'pwd first, then ls to see what actually exists. Remember case sensitivity: Notes.txt ≠ notes.txt.' },
        { error: 'sudo: user is not in the sudoers file', cause: 'Your account has no admin rights', fix: 'Ask an admin to add you to the sudo/admin group. On your own machine, log in as root or another sudoer.' },
        { error: 'A command is hung / printing forever', cause: 'tail -f, a long job, or a crash loop', fix: 'Ctrl+C to interrupt. If that fails, Ctrl+Z then kill %1.' }
      ]
    },

    {
      id: 'quiz',
      type: 'quiz',
      title: 'Knowledge Check',
      content: {
        title: 'Linux CLI Quiz',
        type: 'knowledge-check',
        questions: [
          {
            id: 'q1',
            question: 'You ran a long command in the wrong directory. What is the FASTEST way to go back to the directory you were just in?',
            options: [
              { id: 'a', text: 'cd ~' },
              { id: 'b', text: 'cd -' },
              { id: 'c', text: 'cd ..' },
              { id: 'd', text: 'history | grep cd' }
            ],
            correctId: 'b',
            explanation: 'cd - jumps straight to the previous working directory (stored in $OLDPWD). .. goes up one level (not back), ~ goes home.',
            difficulty: 'beginner'
          },
          {
            id: 'q2',
            question: 'What does `chmod 640 secrets.env` mean?',
            options: [
              { id: 'a', text: 'Everyone can read; only root can write' },
              { id: 'b', text: 'Owner read+write, group read, others nothing' },
              { id: 'c', text: 'Owner read only, group write, others execute' },
              { id: 'd', text: 'Sets file size limit to 640 bytes' }
            ],
            correctId: 'b',
            explanation: 'Octal: 6 = rw- (owner), 4 = r-- (group), 0 = --- (others). Perfect for env files containing credentials.',
            difficulty: 'intermediate'
          },
          {
            id: 'q3',
            question: 'You want to count how many lines in syslog contain "timeout". Which command?',
            options: [
              { id: 'a', text: 'cat /var/log/syslog > timeout' },
              { id: 'b', text: 'grep timeout /var/log/syslog | wc -l' },
              { id: 'c', text: 'find /var/log -name timeout' },
              { id: 'd', text: 'tail -f /var/log/syslog | count timeout' }
            ],
            correctId: 'b',
            explanation: 'grep filters matching lines, the pipe hands them to wc -l which counts them. Pipes compose small tools into answers.',
            difficulty: 'beginner'
          },
          {
            id: 'q4',
            question: 'What is the difference between `>` and `>>`?',
            options: [
              { id: 'a', text: '> writes stdout overwriting the file; >> appends' },
              { id: 'b', text: '> appends; >> overwrites' },
              { id: 'c', text: '> is for text files; >> is for binary files' },
              { id: 'd', text: 'No difference — >> is just the "safe" alias' }
            ],
            correctId: 'a',
            explanation: '> truncates and replaces the file (dangerous on logs!), >> appends to the end. Getting this wrong has destroyed many a config.',
            difficulty: 'beginner'
          },
          {
            id: 'q5',
            question: 'A script fails with "Permission denied" even though you own it. Most likely cause?',
            options: [
              { id: 'a', text: 'The disk is full' },
              { id: 'b', text: 'The file lacks the execute bit — needs chmod +x' },
              { id: 'c', text: 'You must run it with sudo' },
              { id: 'd', text: 'The filename contains a dot' }
            ],
            correctId: 'b',
            explanation: 'Ownership alone isn\'t enough — the x bit must be set. Check with ls -l; fix with chmod +x. Sudo would be the wrong instinct.',
            difficulty: 'beginner'
          }
        ]
      }
    },

    {
      id: 'challenge',
      type: 'challenge',
      title: 'Challenge: Craft a One-Liner',
      content: {
        title: 'Find the Noisy Errors',
        description: 'Write a single command line that finds every line containing "ERROR" inside all .log files under /var/log, counts them, and saves the count into a file called error-count.txt in your home directory.',
        difficulty: 'beginner',
        requirements: [
          'Search recursively inside /var/log',
          'Match only the literal string ERROR',
          'Count the matching lines (not the files)',
          'Save the final number to ~/error-count.txt',
          'Do it in ONE command — pipes and redirection only'
        ],
        starterCode: `# one line — grep it, count it, save it\n`,
        language: 'bash',
        hints: [
          'grep can search a whole directory tree with -r',
          'wc -l counts lines',
          '> redirects stdout into a file'
        ],
        testCases: [
          { description: 'Uses grep recursively', expectedOutput: 'grep' },
          { description: 'Counts lines', expectedOutput: 'wc -l' },
          { description: 'Searches /var/log', expectedOutput: '/var/log' },
          { description: 'Matches ERROR', expectedOutput: 'ERROR' },
          { description: 'Writes to error-count.txt', expectedOutput: 'error-count.txt' }
        ]
      }
    },

    {
      id: 'interview',
      type: 'interview',
      title: 'Interview Preparation',
      content: { questions: [
        { difficulty: 'beginner', question: 'How do you find out what\'s filling up a disk?', shortAnswer: 'df -h for filesystem usage, then du -sh /* or ls -lhS to drill into the largest directories/files.', deepExplanation: 'df reports mounted filesystems. du -sh on directories shows size per directory. Sort with | sort -rh | head. On servers, /var/log is the usual suspect.', example: 'df -h shows /var at 98% → du -sh /var/* | sort -rh | head -5 → /var/log/syslog is 12GB.', commonMistake: 'Using ls alone — it shows file sizes, not recursive directory sizes.', followUp: 'How do you clear space safely without breaking running services?' },
        { difficulty: 'beginner', question: 'Explain the difference between a hard link and a soft link.', shortAnswer: 'Soft (symbolic) link = a pointer to a path, breaks if the target moves. Hard link = another name for the same inode — the data survives deleting the "original".', deepExplanation: 'ln -s creates symlinks (can cross filesystems, can point to dirs). ln creates hard links (same filesystem only, no dirs). Data is freed only when the last hard link is removed.', example: 'ln -s /opt/app/config.yml ~/config.yml — a shortcut. Hard links are how snapshots/dedup tools work.', commonMistake: 'Assuming deleting the symlink target removes the link too — it just dangles.', followUp: 'Why do hard links not work across filesystems?' },
        { difficulty: 'intermediate', question: 'A process won\'t die with Ctrl+C. What do you do?', shortAnswer: 'kill <PID> (SIGTERM, polite), then kill -9 <PID> (SIGKILL, unstoppable) as last resort.', deepExplanation: 'SIGTERM lets the process clean up; SIGKILL removes it instantly without cleanup — can leave locks/temp files. Find the PID via ps aux | grep or pgrep.', example: 'pgrep -f app.py → kill 1842 → still alive? kill -9 1842.', commonMistake: 'Reaching for kill -9 first — it skips cleanup and can corrupt state.', followUp: 'What is the difference between SIGTERM, SIGKILL, and SIGHUP?' },
        { difficulty: 'intermediate', question: 'How does SSH key authentication work — and why is ~/.ssh 700 / keys 600?', shortAnswer: 'Private key on client proves identity to the public key on the server. Loose permissions = ssh refuses to use the key.', deepExplanation: 'The server encrypts a challenge with your public key; only the private key can answer it. SSH enforces permissions because a world-readable private key might have leaked.', example: 'chmod 700 ~/.ssh && chmod 600 ~/.ssh/id_rsa — otherwise: "UNPROTECTED PRIVATE KEY FILE!" error.', commonMistake: 'chmod 777 to "fix" the error — ssh still refuses AND now the key is unsafe.', followUp: 'How do ssh-agent and authorized_keys fit in?' }
      ] }
    },

    { id: 'next', type: 'next', title: '', content: { prev: { title: 'Chapter 47: Cost Explorer & Budgets', url: 'module-47.html' }, next: { title: 'Chapter 01: AWS IAM', url: 'module-01.html' } } }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MODULE_48_DATA;
} else {
  window.MODULE_48_DATA = MODULE_48_DATA;
}
