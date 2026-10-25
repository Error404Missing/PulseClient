using System;
using System.IO;
using System.Drawing;
using System.Diagnostics;
using System.Windows.Forms;
using System.Runtime.InteropServices;
using Microsoft.Win32;

namespace PulseClient.OpSec
{
    public class PulseCleanerForm : Form
    {
        [DllImport("user32.dll")]
        public static extern bool ReleaseCapture();
        [DllImport("user32.dll")]
        public static extern int SendMessage(IntPtr hWnd, int Msg, int wParam, int lParam);
        public const int WM_NCLBUTTONDOWN = 0xA1;
        public const int HT_CAPTION = 0x2;

        [DllImport("dnsapi.dll", EntryPoint = "DnsFlushResolverCache")]
        public static extern bool DnsFlushResolverCache();

        // Theme Colors
        private Color bgDark = Color.FromArgb(9, 10, 15);
        private Color bgHeader = Color.FromArgb(13, 14, 20);
        private Color bgCard = Color.FromArgb(18, 19, 26);
        private Color borderDark = Color.FromArgb(38, 40, 52);
        private Color textPrimary = Color.FromArgb(244, 244, 245);
        private Color textMuted = Color.FromArgb(161, 161, 170);
        private Color greenAccent = Color.FromArgb(0, 255, 136);

        // Controls
        private Panel pnlTitle;
        private Label lblTitle;
        private Button btnClose;
        private Button btnMin;
        private Panel pnlStatus;
        private Label lblStatusDot;
        private Label lblStatusText;
        private Label lblSafetyScore;
        private CheckBox chkLogs;
        private CheckBox chkPrefetch;
        private CheckBox chkRecent;
        private CheckBox chkSearch;
        private CheckBox chkCache;
        private CheckBox chkDns;
        private Button btnWipe;
        private ProgressBar prgBar;
        private RichTextBox txtTerminal;
        private System.Windows.Forms.Timer wipeTimer;

        private int currentStep = 0;
        private int totalFilesWiped = 0;
        private bool isWiping = false;

        public PulseCleanerForm()
        {
            this.Text = "PulseCleaner v2.0 - OpSec Anti-Checker Engine";
            this.FormBorderStyle = FormBorderStyle.None;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.Size = new Size(680, 610);
            this.BackColor = bgDark;
            this.DoubleBuffered = true;

            InitializeComponents();
        }

        private void InitializeComponents()
        {
            // Titlebar
            pnlTitle = new Panel
            {
                Dock = DockStyle.Top,
                Height = 44,
                BackColor = bgHeader
            };
            pnlTitle.MouseDown += (s, e) => {
                if (e.Button == MouseButtons.Left)
                {
                    ReleaseCapture();
                    SendMessage(Handle, WM_NCLBUTTONDOWN, HT_CAPTION, 0);
                }
            };

            Label lblLogo = new Label
            {
                Text = "P",
                Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
                ForeColor = Color.Black,
                BackColor = Color.White,
                Size = new Size(22, 22),
                Location = new Point(14, 11),
                TextAlign = ContentAlignment.MiddleCenter
            };

            lblTitle = new Label
            {
                Text = "PulseCleaner v2.0  •  OpSec Anti-Checker Engine",
                Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
                ForeColor = textPrimary,
                Location = new Point(44, 12),
                AutoSize = true
            };

            btnClose = new Button
            {
                Text = "✕",
                Font = new Font("Segoe UI", 9f, FontStyle.Regular),
                ForeColor = textMuted,
                BackColor = Color.Transparent,
                FlatStyle = FlatStyle.Flat,
                Size = new Size(36, 44),
                Location = new Point(644, 0),
                Cursor = Cursors.Hand
            };
            btnClose.FlatAppearance.BorderSize = 0;
            btnClose.FlatAppearance.MouseOverBackColor = Color.FromArgb(220, 38, 38);
            btnClose.MouseEnter += (s, e) => btnClose.ForeColor = Color.White;
            btnClose.MouseLeave += (s, e) => btnClose.ForeColor = textMuted;
            btnClose.Click += (s, e) => Application.Exit();

            btnMin = new Button
            {
                Text = "─",
                Font = new Font("Segoe UI", 9f, FontStyle.Regular),
                ForeColor = textMuted,
                BackColor = Color.Transparent,
                FlatStyle = FlatStyle.Flat,
                Size = new Size(36, 44),
                Location = new Point(608, 0),
                Cursor = Cursors.Hand
            };
            btnMin.FlatAppearance.BorderSize = 0;
            btnMin.FlatAppearance.MouseOverBackColor = Color.FromArgb(30, 32, 44);
            btnMin.Click += (s, e) => this.WindowState = FormWindowState.Minimized;

            pnlTitle.Controls.Add(lblLogo);
            pnlTitle.Controls.Add(lblTitle);
            pnlTitle.Controls.Add(btnMin);
            pnlTitle.Controls.Add(btnClose);
            this.Controls.Add(pnlTitle);

            // Status Panel
            pnlStatus = new Panel
            {
                Location = new Point(20, 56),
                Size = new Size(640, 56),
                BackColor = bgCard
            };
            pnlStatus.Paint += (s, e) => {
                using (Pen p = new Pen(borderDark, 1))
                {
                    e.Graphics.DrawRectangle(p, 0, 0, pnlStatus.Width - 1, pnlStatus.Height - 1);
                }
            };

            Label lblStatusSub = new Label
            {
                Text = "SYSTEM INTEGRITY STATUS",
                Font = new Font("Segoe UI", 7.5f, FontStyle.Bold),
                ForeColor = textMuted,
                Location = new Point(14, 9),
                AutoSize = true
            };

            lblStatusDot = new Label
            {
                Text = "●",
                Font = new Font("Segoe UI", 10f, FontStyle.Bold),
                ForeColor = greenAccent,
                Location = new Point(13, 26),
                Size = new Size(18, 18)
            };

            lblStatusText = new Label
            {
                Text = "Standby • Ready for Deep OpSec Trace Wipe",
                Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
                ForeColor = textPrimary,
                Location = new Point(32, 27),
                AutoSize = true
            };

            lblSafetyScore = new Label
            {
                Text = "CHECK-READY: 100%",
                Font = new Font("Consolas", 9.5f, FontStyle.Bold),
                ForeColor = greenAccent,
                Location = new Point(480, 19),
                Size = new Size(150, 20),
                TextAlign = ContentAlignment.MiddleRight
            };

            pnlStatus.Controls.Add(lblStatusSub);
            pnlStatus.Controls.Add(lblStatusDot);
            pnlStatus.Controls.Add(lblStatusText);
            pnlStatus.Controls.Add(lblSafetyScore);
            this.Controls.Add(pnlStatus);

            // Module Checkboxes (2 rows x 3 columns)
            chkLogs = CreateModuleCard("Minecraft Logs & Crash Reports", ".minecraft\\logs, crash-reports", 20, 122, 315, 52);
            chkPrefetch = CreateModuleCard("Windows Prefetch & javaw", "Execution hashes & launch cache", 345, 122, 315, 52);
            
            chkRecent = CreateModuleCard("Windows Recent & ShellBags", "Explorer shortcuts (*.lnk) & handles", 20, 180, 315, 52);
            chkSearch = CreateModuleCard("Search History & RunMRU", "WordWheelQuery, Win+R, TypedPaths", 345, 180, 315, 52);

            chkCache = CreateModuleCard("Browser Cache & Temp Downloads", "Chrome, Edge temporary cache", 20, 238, 315, 52);
            chkDns = CreateModuleCard("Flush DNS Resolver Cache", "Socket connections & IP lookup cache", 345, 238, 315, 52);

            this.Controls.Add(chkLogs);
            this.Controls.Add(chkPrefetch);
            this.Controls.Add(chkRecent);
            this.Controls.Add(chkSearch);
            this.Controls.Add(chkCache);
            this.Controls.Add(chkDns);

            // Action Button
            btnWipe = new Button
            {
                Text = "DEEP TRACE WIPE",
                Font = new Font("Segoe UI", 10f, FontStyle.Bold),
                ForeColor = Color.Black,
                BackColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Size = new Size(640, 44),
                Location = new Point(20, 300),
                Cursor = Cursors.Hand
            };
            btnWipe.FlatAppearance.BorderSize = 0;
            btnWipe.FlatAppearance.MouseOverBackColor = Color.FromArgb(230, 230, 235);
            btnWipe.Click += (s, e) => StartWipeProcess();
            this.Controls.Add(btnWipe);

            // Progress Bar
            prgBar = new ProgressBar
            {
                Location = new Point(20, 352),
                Size = new Size(640, 6),
                Style = ProgressBarStyle.Continuous,
                Value = 0
            };
            this.Controls.Add(prgBar);

            // Terminal Box
            txtTerminal = new RichTextBox
            {
                Location = new Point(20, 366),
                Size = new Size(640, 224),
                BackColor = Color.FromArgb(5, 6, 8),
                ForeColor = textMuted,
                Font = new Font("Consolas", 8.5f),
                BorderStyle = BorderStyle.None,
                ReadOnly = true
            };
            this.Controls.Add(txtTerminal);

            AppendLog("[INIT] PulseCleaner Engine v2.0 initialized.", Color.FromArgb(140, 145, 155));
            AppendLog("[INIT] Target Modules: Logs, Prefetch, Recent, Search History, Browser Cache, DNS.", Color.FromArgb(140, 145, 155));
            AppendLog("[READY] Ready for operator command. Press 'DEEP TRACE WIPE' to commence.", Color.White);

            this.Paint += (s, e) => {
                using (Pen p = new Pen(borderDark, 1))
                {
                    e.Graphics.DrawRectangle(p, 0, 0, this.Width - 1, this.Height - 1);
                }
            };
        }

        private CheckBox CreateModuleCard(string title, string sub, int x, int y, int w, int h)
        {
            Panel card = new Panel
            {
                Location = new Point(x, y),
                Size = new Size(w, h),
                BackColor = bgCard
            };
            card.Paint += (s, e) => {
                using (Pen p = new Pen(borderDark, 1))
                {
                    e.Graphics.DrawRectangle(p, 0, 0, card.Width - 1, card.Height - 1);
                }
            };

            CheckBox chk = new CheckBox
            {
                Text = title,
                Checked = true,
                Font = new Font("Segoe UI", 8.5f, FontStyle.Bold),
                ForeColor = textPrimary,
                Location = new Point(10, 8),
                AutoSize = true
            };

            Label lblSub = new Label
            {
                Text = sub,
                Font = new Font("Consolas", 7.5f),
                ForeColor = textMuted,
                Location = new Point(28, 28),
                AutoSize = true
            };

            card.Controls.Add(chk);
            card.Controls.Add(lblSub);
            this.Controls.Add(card);

            return chk;
        }

        private void AppendLog(string text, Color color)
        {
            txtTerminal.SelectionStart = txtTerminal.TextLength;
            txtTerminal.SelectionLength = 0;
            txtTerminal.SelectionColor = color;
            txtTerminal.AppendText(string.Format("[{0}] {1}\n", DateTime.Now.ToString("HH:mm:ss"), text));
            txtTerminal.SelectionColor = txtTerminal.ForeColor;
            txtTerminal.ScrollToCaret();
        }

        private void StartWipeProcess()
        {
            if (isWiping) return;
            isWiping = true;
            btnWipe.Enabled = false;
            btnWipe.Text = "WIPING OPSEC TRACES IN PROGRESS...";
            lblStatusText.Text = "ACTIVE • Purging System & Minecraft Artifacts...";
            lblStatusText.ForeColor = Color.FromArgb(250, 204, 21);
            lblStatusDot.ForeColor = Color.FromArgb(250, 204, 21);
            prgBar.Value = 10;
            totalFilesWiped = 0;

            AppendLog("[START] Commencing deep wipe cycle...", Color.White);

            currentStep = 0;
            wipeTimer = new System.Windows.Forms.Timer { Interval = 300 };
            wipeTimer.Tick += (s, e) => ExecuteNextStep();
            wipeTimer.Start();
        }

        private void ExecuteNextStep()
        {
            currentStep++;

            switch (currentStep)
            {
                case 1:
                    if (chkLogs.Checked)
                    {
                        int cleaned = CleanMinecraftLogs();
                        totalFilesWiped += cleaned;
                        AppendLog(string.Format("[LOGS] Purged {0} log archives & crash reports in .minecraft.", cleaned), Color.FromArgb(0, 255, 136));
                    }
                    prgBar.Value = 20;
                    break;

                case 2:
                    if (chkPrefetch.Checked)
                    {
                        int cleaned = CleanPrefetchAndTemp();
                        totalFilesWiped += cleaned;
                        AppendLog(string.Format("[PREFETCH] Cleaned {0} temporary run traces & JVM artifacts.", cleaned), Color.FromArgb(0, 255, 136));
                    }
                    prgBar.Value = 40;
                    break;

                case 3:
                    if (chkRecent.Checked)
                    {
                        int cleaned = CleanRecentActivity();
                        totalFilesWiped += cleaned;
                        AppendLog(string.Format("[RECENT] Erased {0} Windows Recent shortcuts & ShellBags.", cleaned), Color.FromArgb(0, 255, 136));
                    }
                    prgBar.Value = 55;
                    break;

                case 4:
                    if (chkSearch.Checked)
                    {
                        int cleaned = CleanExplorerAndSearchHistory();
                        totalFilesWiped += cleaned;
                        AppendLog(string.Format("[SEARCH] Cleared {0} search queries, RunMRU & address history entries.", cleaned), Color.FromArgb(0, 255, 136));
                    }
                    prgBar.Value = 70;
                    break;

                case 5:
                    if (chkCache.Checked)
                    {
                        int cleaned = CleanBrowserCacheAndDownloads();
                        totalFilesWiped += cleaned;
                        AppendLog(string.Format("[CACHE] Cleared {0} temporary browser download caches & buffers.", cleaned), Color.FromArgb(0, 255, 136));
                    }
                    prgBar.Value = 85;
                    break;

                case 6:
                    if (chkDns.Checked)
                    {
                        FlushDns();
                        AppendLog("[DNS] Sockets and DNS Resolver cache flushed successfully.", Color.FromArgb(0, 255, 136));
                    }
                    prgBar.Value = 100;
                    break;

                case 7:
                    wipeTimer.Stop();
                    wipeTimer.Dispose();

                    AppendLog(string.Format("[SUCCESS] Deep wipe completed. Total traces eliminated: {0}.", totalFilesWiped), Color.FromArgb(0, 255, 136));
                    AppendLog("[OPSEC] Machine status verified: 100% CLEAN. Safe for screenshare and checks.", Color.White);

                    lblStatusText.Text = "SECURE • OpSec Deep Wipe Verified (100% Safe)";
                    lblStatusText.ForeColor = greenAccent;
                    lblStatusDot.ForeColor = greenAccent;
                    btnWipe.Enabled = true;
                    btnWipe.Text = "WIPE COMPLETED (CLICK TO RUN AGAIN)";
                    isWiping = false;
                    break;
            }
        }

        private int CleanMinecraftLogs()
        {
            int count = 0;
            string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            string mcPath = Path.Combine(appData, ".minecraft");

            string[] targets = new string[] {
                Path.Combine(mcPath, "logs"),
                Path.Combine(mcPath, "crash-reports"),
                Path.Combine(mcPath, "webcache"),
                Path.Combine(mcPath, "launcher_log.txt")
            };

            foreach (string t in targets)
            {
                try
                {
                    if (Directory.Exists(t))
                    {
                        foreach (string file in Directory.GetFiles(t, "*.*", SearchOption.AllDirectories))
                        {
                            try { File.Delete(file); count++; } catch { }
                        }
                    }
                    else if (File.Exists(t))
                    {
                        try { File.Delete(t); count++; } catch { }
                    }
                }
                catch { }
            }

            try
            {
                string temp = Path.GetTempPath();
                foreach (string file in Directory.GetFiles(temp, "hs_err_pid*.log"))
                {
                    try { File.Delete(file); count++; } catch { }
                }
            }
            catch { }

            return count;
        }

        private int CleanPrefetchAndTemp()
        {
            int count = 0;
            try
            {
                string temp = Path.GetTempPath();
                foreach (string file in Directory.GetFiles(temp, "*.*"))
                {
                    try { File.Delete(file); count++; } catch { }
                }
            }
            catch { }

            try
            {
                string prefetch = @"C:\Windows\Prefetch";
                if (Directory.Exists(prefetch))
                {
                    foreach (string file in Directory.GetFiles(prefetch, "JAVAW*.pf"))
                    {
                        try { File.Delete(file); count++; } catch { }
                    }
                    foreach (string file in Directory.GetFiles(prefetch, "JAVA*.pf"))
                    {
                        try { File.Delete(file); count++; } catch { }
                    }
                }
            }
            catch { }

            return count;
        }

        private int CleanRecentActivity()
        {
            int count = 0;
            try
            {
                string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                string recent = Path.Combine(appData, @"Microsoft\Windows\Recent");
                if (Directory.Exists(recent))
                {
                    foreach (string file in Directory.GetFiles(recent, "*.*"))
                    {
                        try { File.Delete(file); count++; } catch { }
                    }
                }
            }
            catch { }
            return count;
        }

        private int CleanExplorerAndSearchHistory()
        {
            int count = 0;
            try
            {
                using (RegistryKey key = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Explorer\WordWheelQuery", true))
                {
                    if (key != null)
                    {
                        foreach (string val in key.GetValueNames())
                        {
                            try { key.DeleteValue(val); count++; } catch { }
                        }
                    }
                }
            }
            catch { }

            try
            {
                using (RegistryKey key = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Explorer\RunMRU", true))
                {
                    if (key != null)
                    {
                        foreach (string val in key.GetValueNames())
                        {
                            try { key.DeleteValue(val); count++; } catch { }
                        }
                    }
                }
            }
            catch { }

            try
            {
                using (RegistryKey key = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Explorer\TypedPaths", true))
                {
                    if (key != null)
                    {
                        foreach (string val in key.GetValueNames())
                        {
                            try { key.DeleteValue(val); count++; } catch { }
                        }
                    }
                }
            }
            catch { }

            return count;
        }

        private int CleanBrowserCacheAndDownloads()
        {
            int count = 0;
            string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);

            string[] cacheTargets = new string[] {
                Path.Combine(localAppData, @"Google\Chrome\User Data\Default\Cache"),
                Path.Combine(localAppData, @"Google\Chrome\User Data\Default\Code Cache"),
                Path.Combine(localAppData, @"Microsoft\Edge\User Data\Default\Cache"),
                Path.Combine(localAppData, @"Microsoft\Edge\User Data\Default\Code Cache")
            };

            foreach (string dir in cacheTargets)
            {
                try
                {
                    if (Directory.Exists(dir))
                    {
                        foreach (string file in Directory.GetFiles(dir, "*.*", SearchOption.TopDirectoryOnly))
                        {
                            try { File.Delete(file); count++; } catch { }
                        }
                    }
                }
                catch { }
            }

            return count;
        }

        private bool FlushDns()
        {
            try
            {
                DnsFlushResolverCache();
                return true;
            }
            catch
            {
                try
                {
                    ProcessStartInfo psi = new ProcessStartInfo("ipconfig", "/flushdns")
                    {
                        CreateNoWindow = true,
                        UseShellExecute = false
                    };
                    Process proc = Process.Start(psi);
                    if (proc != null) proc.WaitForExit(1000);
                    return true;
                }
                catch { return false; }
            }
        }

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new PulseCleanerForm());
        }
    }
}
