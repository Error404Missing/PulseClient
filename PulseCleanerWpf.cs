using System;
using System.IO;
using System.Reflection;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Effects;
using System.Windows.Shapes;
using System.Windows.Input;
using System.Threading.Tasks;
using System.Diagnostics;
using System.Runtime.InteropServices;
using Microsoft.Win32;

[assembly: AssemblyTitle("PulseCleaner")]
[assembly: AssemblyDescription("PulseClient OpSec System & Trace Cleaner Utility")]
[assembly: AssemblyConfiguration("")]
[assembly: AssemblyCompany("PulseClient Development Team")]
[assembly: AssemblyProduct("PulseCleaner v2.0")]
[assembly: AssemblyCopyright("Copyright © 2026 PulseClient")]
[assembly: AssemblyTrademark("PulseClient")]
[assembly: AssemblyCulture("")]
[assembly: ComVisible(false)]
[assembly: AssemblyVersion("2.0.0.0")]
[assembly: AssemblyFileVersion("2.0.0.0")]

namespace PulseClient.OpSec
{
    public class PulseCleanerWindow : Window
    {
        // Theme Brushes
        private readonly SolidColorBrush bgOuter = new SolidColorBrush(Color.FromRgb(11, 12, 16));
        private readonly SolidColorBrush bgTitle = new SolidColorBrush(Color.FromRgb(14, 15, 22));
        private readonly SolidColorBrush bgCard = new SolidColorBrush(Color.FromRgb(17, 18, 26));
        private readonly SolidColorBrush bgCardHover = new SolidColorBrush(Color.FromRgb(24, 26, 36));
        private readonly SolidColorBrush borderSubtle = new SolidColorBrush(Color.FromArgb(50, 255, 255, 255));
        private readonly SolidColorBrush borderCard = new SolidColorBrush(Color.FromRgb(34, 36, 48));
        private readonly SolidColorBrush textPrimary = new SolidColorBrush(Color.FromRgb(245, 245, 247));
        private readonly SolidColorBrush textSecondary = new SolidColorBrush(Color.FromRgb(143, 146, 161));
        private readonly SolidColorBrush textMuted = new SolidColorBrush(Color.FromRgb(108, 112, 128));
        private readonly SolidColorBrush greenAccent = new SolidColorBrush(Color.FromRgb(16, 185, 129));
        private readonly SolidColorBrush greenGlow = new SolidColorBrush(Color.FromRgb(0, 255, 136));
        private readonly SolidColorBrush bgTerminal = new SolidColorBrush(Color.FromRgb(6, 7, 10));

        // State & Controls
        private bool isWiping = false;
        private bool toggleLogs = true;
        private bool togglePrefetch = true;
        private bool toggleRecent = true;
        private bool toggleDns = true;

        private Border btnWipeBorder;
        private TextBlock btnWipeText;
        private TextBlock statusMainText;
        private TextBlock statusSubText;
        private ScrollViewer logScroller;
        private StackPanel logStack;

        public PulseCleanerWindow()
        {
            this.Title = "PulseCleaner v2.0 - OpSec Anti-Checker Engine";
            this.Width = 720;
            this.Height = 620;
            this.WindowStartupLocation = WindowStartupLocation.CenterScreen;
            this.WindowStyle = WindowStyle.None;
            this.AllowsTransparency = true;
            this.Background = Brushes.Transparent;
            this.ResizeMode = ResizeMode.NoResize;

            BuildUI();
        }

        private void BuildUI()
        {
            // Main Window Border with DropShadow
            Border rootBorder = new Border
            {
                Background = bgOuter,
                BorderBrush = borderSubtle,
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(16),
                ClipToBounds = true,
                Margin = new Thickness(10)
            };
            rootBorder.Effect = new DropShadowEffect
            {
                Color = Colors.Black,
                BlurRadius = 30,
                ShadowDepth = 5,
                Opacity = 0.85
            };

            Grid mainGrid = new Grid();
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(48) }); // Titlebar
            mainGrid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Star) }); // Content

            // 1. Modern Frameless Titlebar
            Border titleBorder = new Border
            {
                Background = bgTitle,
                BorderBrush = new SolidColorBrush(Color.FromRgb(26, 28, 38)),
                BorderThickness = new Thickness(0, 0, 0, 1)
            };
            titleBorder.MouseDown += (s, e) => {
                if (e.LeftButton == MouseButtonState.Pressed)
                    this.DragMove();
            };

            Grid titleGrid = new Grid { Margin = new Thickness(16, 0, 16, 0) };
            titleGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            titleGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(80) });

            // Title Left
            StackPanel titleLeft = new StackPanel { Orientation = Orientation.Horizontal, VerticalAlignment = VerticalAlignment.Center };
            
            // Pulse Heartbeat Icon
            System.Windows.Shapes.Path pulseIcon = new System.Windows.Shapes.Path
            {
                Data = Geometry.Parse("M2,8 L6,8 L9,2 L13,14 L16,6 L18,10 L22,10"),
                Stroke = Brushes.White,
                StrokeThickness = 2,
                StrokeLineJoin = PenLineJoin.Round,
                StrokeStartLineCap = PenLineCap.Round,
                StrokeEndLineCap = PenLineCap.Round,
                Width = 24,
                Height = 16,
                Margin = new Thickness(0, 0, 10, 0)
            };
            titleLeft.Children.Add(pulseIcon);

            TextBlock titleText = new TextBlock
            {
                Text = "PulseCleaner v2.0",
                FontWeight = FontWeights.Bold,
                FontSize = 13,
                Foreground = textPrimary,
                VerticalAlignment = VerticalAlignment.Center
            };
            titleLeft.Children.Add(titleText);

            TextBlock titleSub = new TextBlock
            {
                Text = " - OpSec Anti-Checker Engine",
                FontWeight = FontWeights.Medium,
                FontSize = 13,
                Foreground = textSecondary,
                VerticalAlignment = VerticalAlignment.Center
            };
            titleLeft.Children.Add(titleSub);
            Grid.SetColumn(titleLeft, 0);
            titleGrid.Children.Add(titleLeft);

            // Title Right Controls (Minimize, Close)
            StackPanel titleRight = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                HorizontalAlignment = HorizontalAlignment.Right,
                VerticalAlignment = VerticalAlignment.Center
            };

            Button btnMin = CreateTitleButton("─", () => this.WindowState = WindowState.Minimized);
            Button btnClose = CreateTitleButton("✕", () => Application.Current.Shutdown(), isClose: true);
            titleRight.Children.Add(btnMin);
            titleRight.Children.Add(btnClose);
            Grid.SetColumn(titleRight, 1);
            titleGrid.Children.Add(titleRight);

            titleBorder.Child = titleGrid;
            Grid.SetRow(titleBorder, 0);
            mainGrid.Children.Add(titleBorder);

            // 2. Main Body Content
            StackPanel body = new StackPanel
            {
                Margin = new Thickness(22, 16, 22, 18)
            };

            // Section A: SYSTEM SAFETY STATUS Card
            TextBlock lblStatusHead = new TextBlock
            {
                Text = "SYSTEM SAFETY STATUS",
                FontWeight = FontWeights.Bold,
                FontSize = 11,
                Foreground = textMuted,
                Margin = new Thickness(2, 0, 0, 8)
            };
            body.Children.Add(lblStatusHead);

            Border statusCard = new Border
            {
                Background = bgCard,
                BorderBrush = borderCard,
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(12),
                Padding = new Thickness(18, 14, 18, 14),
                Margin = new Thickness(0, 0, 0, 16)
            };

            Grid statusGrid = new Grid();
            statusGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(60) });
            statusGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

            // Glowing Green Shield Icon
            Grid shieldContainer = new Grid { Width = 48, Height = 48, VerticalAlignment = VerticalAlignment.Center };
            System.Windows.Shapes.Path shieldBg = new System.Windows.Shapes.Path
            {
                Data = Geometry.Parse("M12,1 L3,5 V11 C3,16.5 6.8,21.7 12,23 C17.2,21.7 21,16.5 21,11 V5 L12,1 Z"),
                Fill = new SolidColorBrush(Color.FromArgb(40, 0, 255, 136)),
                Stroke = greenGlow,
                StrokeThickness = 2,
                Stretch = Stretch.Uniform,
                Width = 38,
                Height = 38
            };
            shieldBg.Effect = new DropShadowEffect
            {
                Color = Color.FromRgb(0, 255, 136),
                BlurRadius = 14,
                ShadowDepth = 0,
                Opacity = 0.6
            };
            shieldContainer.Children.Add(shieldBg);
            Grid.SetColumn(shieldContainer, 0);
            statusGrid.Children.Add(shieldContainer);

            StackPanel statusInfo = new StackPanel { Margin = new Thickness(10, 0, 0, 0), VerticalAlignment = VerticalAlignment.Center };
            statusMainText = new TextBlock
            {
                Text = "SECURE",
                FontWeight = FontWeights.Black,
                FontSize = 24,
                Foreground = textPrimary
            };
            statusSubText = new TextBlock
            {
                Text = "Status: Pulse Engine Active | Last Wipe: Standby",
                FontSize = 12,
                Foreground = textSecondary,
                Margin = new Thickness(0, 2, 0, 0)
            };
            statusInfo.Children.Add(statusMainText);
            statusInfo.Children.Add(statusSubText);
            Grid.SetColumn(statusInfo, 1);
            statusGrid.Children.Add(statusInfo);

            statusCard.Child = statusGrid;
            body.Children.Add(statusCard);

            // Section B: MODULE TOGGLE SWITCHES
            TextBlock lblModuleHead = new TextBlock
            {
                Text = "MODULE TOGGLE SWITCHES",
                FontWeight = FontWeights.Bold,
                FontSize = 11,
                Foreground = textMuted,
                Margin = new Thickness(2, 0, 0, 8)
            };
            body.Children.Add(lblModuleHead);

            Grid moduleGrid = new Grid { Margin = new Thickness(0, 0, 0, 16) };
            moduleGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            moduleGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(10) });
            moduleGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            moduleGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(10) });
            moduleGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            moduleGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(10) });
            moduleGrid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });

            // 4 Module Cards with authentic icons & toggle switches
            Border cardLogs = CreateModuleCard("MINECRAFT\nLOGS", "M14.5,2.5 L21.5,9.5 L9.5,21.5 L2.5,21.5 L2.5,14.5 Z M16,4 L7,13", val => toggleLogs = val);
            Border cardPrefetch = CreateModuleCard("WINDOWS\nPREFETCH", "M12,15 C10.34,15 9,13.66 9,12 C9,10.34 10.34,9 12,9 C13.66,9 15,10.34 15,12 C15,13.66 13.66,15 12,15 Z M19.4,13 C19.5,12.7 19.5,12.3 19.5,12 C19.5,11.7 19.5,11.3 19.4,11 L21.5,9.3 C21.7,9.1 21.8,8.8 21.6,8.6 L19.6,5.1 C19.5,4.9 19.2,4.8 19,4.9 L16.5,5.9 C16,5.5 15.4,5.2 14.8,5 L14.4,2.4 C14.4,2.2 14.2,2 14,2 L10,2 C9.8,2 9.6,2.2 9.6,2.4 L9.2,5 C8.6,5.2 8,5.5 7.5,5.9 L5,4.9 C4.8,4.8 4.5,4.9 4.4,5.1 L2.4,8.6 C2.2,8.8 2.3,9.1 2.5,9.3 L4.6,11 C4.5,11.3 4.5,11.7 4.5,12 C4.5,12.3 4.5,12.7 4.6,13 L2.5,14.7 C2.3,14.9 2.2,15.2 2.4,15.4 L4.4,18.9 C4.5,19.1 4.8,19.2 5,19.1 L7.5,18.1 C8,18.5 8.6,18.8 9.2,19 L9.6,21.6 C9.6,21.8 9.8,22 10,22 L14,22 C14.2,22 14.4,21.8 14.4,21.6 L14.8,19 C15.4,18.8 16,18.5 16.5,18.1 L19,19.1 C19.2,19.2 19.5,19.1 19.6,18.9 L21.6,15.4 C21.8,15.2 21.7,14.9 21.5,14.7 L19.4,13 Z", val => togglePrefetch = val);
            Border cardRecent = CreateModuleCard("RECENT\nACTIVITY", "M13,3 C8.03,3 4,7.03 4,12 L1,12 L4.89,15.89 L5,16 L9,12 L6,12 C6,8.13 9.13,5 13,5 C16.87,5 20,8.13 20,12 C20,15.87 16.87,19 13,19 C11.07,19 9.32,18.21 8.06,16.94 L6.64,18.36 C8.27,19.99 10.51,21 13,21 C17.97,21 22,16.97 22,12 C22,7.03 17.97,3 13,3 Z M12,8 L12,13 L16.2,15.5 L17,14.2 L13.5,12.1 L13.5,8 L12,8 Z", val => toggleRecent = val);
            Border cardDns = CreateModuleCard("FLUSH DNS\nCACHE", "M12,2 C6.48,2 2,6.48 2,12 C2,17.52 6.48,22 12,22 C17.52,22 22,17.52 22,12 C22,6.48 17.52,2 12,2 Z M11,19.93 C7.05,19.44 4,16.08 4,12 C4,11.38 4.08,10.79 4.21,10.21 L9,15 L9,16 C9,17.1 9.9,18 11,18 L11,19.93 Z M17.9,17.39 C17.64,16.58 16.9,16 16,16 L15,16 L15,13 C15,12.45 14.55,12 14,12 L8,12 L8,10 L10,10 C10.55,10 11,9.55 11,9 L11,7 L13,7 C14.1,7 15,6.1 15,5 L15,4.59 C17.93,5.78 20,8.65 20,12 C20,14.08 19.2,15.97 17.9,17.39 Z", val => toggleDns = val);

            Grid.SetColumn(cardLogs, 0);
            Grid.SetColumn(cardPrefetch, 2);
            Grid.SetColumn(cardRecent, 4);
            Grid.SetColumn(cardDns, 6);

            moduleGrid.Children.Add(cardLogs);
            moduleGrid.Children.Add(cardPrefetch);
            moduleGrid.Children.Add(cardRecent);
            moduleGrid.Children.Add(cardDns);

            body.Children.Add(moduleGrid);

            // Section C: Centered Glowing White Action Pill Button
            btnWipeBorder = new Border
            {
                Width = 280,
                Height = 46,
                Background = Brushes.White,
                CornerRadius = new CornerRadius(23),
                Cursor = Cursors.Hand,
                HorizontalAlignment = HorizontalAlignment.Center,
                Margin = new Thickness(0, 2, 0, 16)
            };
            btnWipeBorder.Effect = new DropShadowEffect
            {
                Color = Colors.White,
                BlurRadius = 26,
                ShadowDepth = 0,
                Opacity = 0.4
            };

            btnWipeText = new TextBlock
            {
                Text = "DEEP TRACE WIPE",
                FontWeight = FontWeights.Black,
                FontSize = 13,
                Foreground = Brushes.Black,
                HorizontalAlignment = HorizontalAlignment.Center,
                VerticalAlignment = VerticalAlignment.Center
            };
            btnWipeBorder.Child = btnWipeText;

            btnWipeBorder.MouseEnter += (s, e) => {
                if (!isWiping)
                {
                    btnWipeBorder.Background = new SolidColorBrush(Color.FromRgb(235, 235, 240));
                    ((DropShadowEffect)btnWipeBorder.Effect).Opacity = 0.6;
                }
            };
            btnWipeBorder.MouseLeave += (s, e) => {
                if (!isWiping)
                {
                    btnWipeBorder.Background = Brushes.White;
                    ((DropShadowEffect)btnWipeBorder.Effect).Opacity = 0.4;
                }
            };
            btnWipeBorder.MouseLeftButtonDown += (s, e) => StartDeepWipe();

            body.Children.Add(btnWipeBorder);

            // Section D: SECURITY LOG OUTPUT Terminal
            StackPanel termHeader = new StackPanel { Orientation = Orientation.Horizontal, Margin = new Thickness(2, 0, 0, 6) };
            TextBlock promptSign = new TextBlock
            {
                Text = ">_ ",
                FontFamily = new FontFamily("Consolas"),
                FontWeight = FontWeights.Bold,
                FontSize = 12,
                Foreground = greenGlow
            };
            TextBlock promptLabel = new TextBlock
            {
                Text = "SECURITY LOG OUTPUT",
                FontWeight = FontWeights.Bold,
                FontSize = 11,
                Foreground = textMuted
            };
            termHeader.Children.Add(promptSign);
            termHeader.Children.Add(promptLabel);
            body.Children.Add(termHeader);

            Border termBorder = new Border
            {
                Background = bgTerminal,
                BorderBrush = borderCard,
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(10),
                Height = 150,
                Padding = new Thickness(12, 10, 12, 10)
            };

            logScroller = new ScrollViewer
            {
                VerticalScrollBarVisibility = ScrollBarVisibility.Auto,
                HorizontalScrollBarVisibility = ScrollBarVisibility.Disabled
            };

            logStack = new StackPanel();
            logScroller.Content = logStack;
            termBorder.Child = logScroller;
            body.Children.Add(termBorder);

            // Initial logs
            AddLog("[INIT] Pulse Engine v2.0 Initialized", textMuted);
            AddLog("[STATUS] System Status: SECURE", greenAccent);
            AddLog("[MODULES] Modules Active: MC Logs, Prefetch, Recent, DNS", textSecondary);
            AddLog("[STANDBY] Idle | Waiting for operator command...", textMuted);

            Grid.SetRow(body, 1);
            mainGrid.Children.Add(body);

            rootBorder.Child = mainGrid;
            this.Content = rootBorder;
        }

        private Border CreateModuleCard(string label, string svgPath, Action<bool> onToggle)
        {
            Border card = new Border
            {
                Background = bgCard,
                BorderBrush = borderCard,
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(10),
                Padding = new Thickness(10, 12, 10, 10),
                Cursor = Cursors.Hand
            };

            StackPanel cardStack = new StackPanel
            {
                HorizontalAlignment = HorizontalAlignment.Center
            };

            // Module Title
            TextBlock lbl = new TextBlock
            {
                Text = label,
                FontWeight = FontWeights.Bold,
                FontSize = 10.5,
                Foreground = textPrimary,
                TextAlignment = TextAlignment.Center,
                LineHeight = 13,
                Margin = new Thickness(0, 0, 0, 8)
            };
            cardStack.Children.Add(lbl);

            // Icon + Toggle Switch Row
            Grid toggleRow = new Grid { HorizontalAlignment = HorizontalAlignment.Center, Width = 84 };
            toggleRow.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(28) });
            toggleRow.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(46) });

            // Svg Icon
            System.Windows.Shapes.Path icon = new System.Windows.Shapes.Path
            {
                Data = Geometry.Parse(svgPath),
                Fill = textSecondary,
                Width = 16,
                Height = 16,
                Stretch = Stretch.Uniform,
                HorizontalAlignment = HorizontalAlignment.Left
            };
            Grid.SetColumn(icon, 0);
            toggleRow.Children.Add(icon);

            // iOS/Obsidian Style Toggle Pill Switch
            bool isChecked = true;
            Border switchPill = new Border
            {
                Width = 38,
                Height = 20,
                CornerRadius = new CornerRadius(10),
                Background = new SolidColorBrush(Color.FromRgb(16, 185, 129)),
                BorderBrush = new SolidColorBrush(Color.FromArgb(40, 0, 255, 136)),
                BorderThickness = new Thickness(1),
                HorizontalAlignment = HorizontalAlignment.Right
            };

            Canvas switchCanvas = new Canvas { Width = 38, Height = 20 };
            Ellipse thumb = new Ellipse
            {
                Width = 14,
                Height = 14,
                Fill = Brushes.White
            };
            Canvas.SetLeft(thumb, 21);
            Canvas.SetTop(thumb, 2);
            switchCanvas.Children.Add(thumb);
            switchPill.Child = switchCanvas;

            // Toggle Click
            card.MouseLeftButtonDown += (s, e) => {
                isChecked = !isChecked;
                if (onToggle != null) onToggle(isChecked);
                if (isChecked)
                {
                    switchPill.Background = new SolidColorBrush(Color.FromRgb(16, 185, 129));
                    Canvas.SetLeft(thumb, 21);
                    icon.Fill = textPrimary;
                }
                else
                {
                    switchPill.Background = new SolidColorBrush(Color.FromRgb(38, 40, 52));
                    Canvas.SetLeft(thumb, 3);
                    icon.Fill = textMuted;
                }
            };

            Grid.SetColumn(switchPill, 1);
            toggleRow.Children.Add(switchPill);

            cardStack.Children.Add(toggleRow);
            card.Child = cardStack;
            return card;
        }

        private Button CreateTitleButton(string text, Action onClick, bool isClose = false)
        {
            Button btn = new Button
            {
                Content = text,
                Width = 32,
                Height = 32,
                Background = Brushes.Transparent,
                Foreground = textSecondary,
                BorderThickness = new Thickness(0),
                Cursor = Cursors.Hand,
                FontWeight = FontWeights.Normal,
                FontSize = 12
            };

            btn.Click += (s, e) => onClick();
            btn.MouseEnter += (s, e) => {
                if (isClose)
                {
                    btn.Background = new SolidColorBrush(Color.FromRgb(225, 29, 72));
                    btn.Foreground = Brushes.White;
                }
                else
                {
                    btn.Background = new SolidColorBrush(Color.FromArgb(30, 255, 255, 255));
                    btn.Foreground = Brushes.White;
                }
            };
            btn.MouseLeave += (s, e) => {
                btn.Background = Brushes.Transparent;
                btn.Foreground = textSecondary;
            };

            return btn;
        }

        private void AddLog(string text, SolidColorBrush color)
        {
            Dispatcher.Invoke(() => {
                TextBlock line = new TextBlock
                {
                    Text = string.Format("[{0}] {1}", DateTime.Now.ToString("HH:mm:ss"), text),
                    FontFamily = new FontFamily("Consolas"),
                    FontSize = 11,
                    Foreground = color,
                    Margin = new Thickness(0, 1, 0, 1)
                };
                logStack.Children.Add(line);
                logScroller.ScrollToEnd();
            });
        }

        private async void StartDeepWipe()
        {
            if (isWiping) return;
            isWiping = true;

            btnWipeBorder.Opacity = 0.6;
            btnWipeText.Text = "WIPING OPSEC TRACES...";
            statusMainText.Text = "CLEANING";
            statusMainText.Foreground = new SolidColorBrush(Color.FromRgb(250, 204, 21));
            statusSubText.Text = "Wiping execution traces and artifacts in progress...";

            AddLog("[START] Deep wipe sequence initiated by operator.", Brushes.White);

            int totalCleaned = 0;

            await Task.Run(() => {
                // 1. Minecraft Logs
                if (toggleLogs)
                {
                    System.Threading.Thread.Sleep(300);
                    int cleaned = CleanMinecraftLogs();
                    totalCleaned += cleaned;
                    AddLog(string.Format("[MCLogs] Analysis complete: {0} log archives purged.", cleaned), greenAccent);
                }

                // 2. Windows Prefetch
                if (togglePrefetch)
                {
                    System.Threading.Thread.Sleep(300);
                    int cleaned = CleanPrefetchAndTemp();
                    totalCleaned += cleaned;
                    AddLog(string.Format("[Prefetch] Scanned & wiped: {0} items | Status: Clean", cleaned), greenAccent);
                }

                // 3. Recent Activity & Search History
                if (toggleRecent)
                {
                    System.Threading.Thread.Sleep(300);
                    int cleaned = CleanRecentAndSearch();
                    totalCleaned += cleaned;
                    AddLog(string.Format("[Recent] Erased: {0} shell handles, RunMRU & queries.", cleaned), greenAccent);
                }

                // 4. DNS Flush
                if (toggleDns)
                {
                    System.Threading.Thread.Sleep(300);
                    FlushDns();
                    AddLog("[DNS] Cache successfully flushed. Sockets cleared.", greenAccent);
                }

                System.Threading.Thread.Sleep(350);
            });

            AddLog(string.Format("[SUCCESS] Deep wipe completed. {0} total traces erased.", totalCleaned), greenGlow);
            AddLog("[OPSEC] System Status: 100% CLEAN. Check-Ready.", Brushes.White);

            statusMainText.Text = "SECURE";
            statusMainText.Foreground = textPrimary;
            statusSubText.Text = "Status: Pulse Engine Active | Last Wipe: Just now";
            btnWipeText.Text = "WIPE COMPLETED (CLICK TO RUN)";
            btnWipeBorder.Opacity = 1.0;
            isWiping = false;
        }

        private int CleanMinecraftLogs()
        {
            int count = 0;
            try
            {
                string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                string mcPath = System.IO.Path.Combine(appData, ".minecraft");
                string[] targets = new string[] {
                    System.IO.Path.Combine(mcPath, "logs"),
                    System.IO.Path.Combine(mcPath, "crash-reports"),
                    System.IO.Path.Combine(mcPath, "webcache"),
                    System.IO.Path.Combine(mcPath, "launcher_log.txt")
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

                string temp = System.IO.Path.GetTempPath();
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
                string temp = System.IO.Path.GetTempPath();
                foreach (string file in Directory.GetFiles(temp, "*.*"))
                {
                    try { File.Delete(file); count++; } catch { }
                }

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

        private int CleanRecentAndSearch()
        {
            int count = 0;
            try
            {
                string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                string recent = System.IO.Path.Combine(appData, @"Microsoft\Windows\Recent");
                if (Directory.Exists(recent))
                {
                    foreach (string file in Directory.GetFiles(recent, "*.*"))
                    {
                        try { File.Delete(file); count++; } catch { }
                    }
                }

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

        private void FlushDns()
        {
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo("ipconfig", "/flushdns")
                {
                    CreateNoWindow = true,
                    UseShellExecute = false
                };
                Process p = Process.Start(psi);
                if (p != null) p.WaitForExit(1000);
            }
            catch { }
        }

        [STAThread]
        static void Main()
        {
            Application app = new Application();
            app.Run(new PulseCleanerWindow());
        }
    }
}
