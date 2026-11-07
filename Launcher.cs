using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Windows.Forms;

[assembly: AssemblyTitle("WireMarket")]
[assembly: AssemblyDescription("Navigateur Warframe Market - Fait par Nyxo_17")]
[assembly: AssemblyCompany("Nyxo_17")]
[assembly: AssemblyProduct("WireMarket (Fait par Nyxo_17)")]
[assembly: AssemblyCopyright("Copyright © Nyxo_17")]
[assembly: AssemblyVersion("1.2.0.0")]
[assembly: AssemblyFileVersion("1.2.0.0")]

namespace WireMarketLauncher
{
    static class Program
    {
        private const int PORT = 8484;
        private static readonly string AppUrl = "http://127.0.0.1:" + PORT;
        private static readonly string ConfigFile = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "WireMarket",
            "install_path.txt"
        );

        private class CacheEntry
        {
            public DateTime Timestamp;
            public int StatusCode;
            public string ContentType;
            public byte[] Body;
        }

        private static readonly ConcurrentDictionary<string, CacheEntry> ApiCache = new ConcurrentDictionary<string, CacheEntry>();

        /* ==================== API WIN32 POUR MODE OVERLAY (TOPMOST & COMPACT) ==================== */
        private delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

        [DllImport("user32.dll")]
        private static extern bool EnumWindows(EnumWindowsProc enumProc, IntPtr lParam);

        [DllImport("user32.dll", CharSet = CharSet.Unicode)]
        private static extern int GetWindowText(IntPtr hWnd, StringBuilder strText, int maxCount);

        [DllImport("user32.dll")]
        private static extern bool IsWindowVisible(IntPtr hWnd);

        [DllImport("user32.dll")]
        private static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

        [DllImport("user32.dll")]
        private static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

        [DllImport("user32.dll")]
        private static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

        [StructLayout(LayoutKind.Sequential)]
        private struct RECT
        {
            public int Left;
            public int Top;
            public int Right;
            public int Bottom;
        }

        private static readonly IntPtr HWND_TOPMOST = new IntPtr(-1);
        private static readonly IntPtr HWND_NOTOPMOST = new IntPtr(-2);
        private const uint SWP_NOSIZE = 0x0001;
        private const uint SWP_NOMOVE = 0x0002;
        private const uint SWP_NOZORDER = 0x0004;
        private const uint SWP_SHOWWINDOW = 0x0040;
        private const int SW_RESTORE = 9;

        private static readonly ConcurrentDictionary<IntPtr, RECT> SavedWindowRects = new ConcurrentDictionary<IntPtr, RECT>();

        private static int ApplyWindowOverlayState(string query)
        {
            bool hasTopmost = query.Contains("topmost=");
            bool topmostVal = query.Contains("topmost=true") || query.Contains("topmost=1");
            bool hasCompact = query.Contains("compact=");
            bool compactVal = query.Contains("compact=true") || query.Contains("compact=1");

            int matched = 0;
            EnumWindows(delegate (IntPtr hWnd, IntPtr lParam)
            {
                if (!IsWindowVisible(hWnd)) return true;
                StringBuilder sb = new StringBuilder(256);
                if (GetWindowText(hWnd, sb, 256) > 0)
                {
                    string title = sb.ToString();
                    if (title.IndexOf("WireMarket", StringComparison.OrdinalIgnoreCase) >= 0)
                    {
                        matched++;
                        if (hasTopmost)
                        {
                            SetWindowPos(hWnd, topmostVal ? HWND_TOPMOST : HWND_NOTOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_SHOWWINDOW);
                        }
                        if (hasCompact)
                        {
                            ShowWindow(hWnd, SW_RESTORE);
                            if (compactVal)
                            {
                                RECT cur;
                                if (GetWindowRect(hWnd, out cur))
                                {
                                    int curW = cur.Right - cur.Left;
                                    if (curW > 600)
                                    {
                                        SavedWindowRects[hWnd] = cur;
                                    }
                                    int targetW = 460;
                                    int targetH = 660;
                                    int newX = Math.Max(10, cur.Right - targetW);
                                    int newY = Math.Max(10, cur.Top);
                                    SetWindowPos(hWnd, IntPtr.Zero, newX, newY, targetW, targetH, SWP_NOZORDER | SWP_SHOWWINDOW);
                                }
                            }
                            else
                            {
                                RECT saved;
                                if (SavedWindowRects.TryRemove(hWnd, out saved))
                                {
                                    int w = Math.Max(960, saved.Right - saved.Left);
                                    int h = Math.Max(680, saved.Bottom - saved.Top);
                                    SetWindowPos(hWnd, IntPtr.Zero, saved.Left, saved.Top, w, h, SWP_NOZORDER | SWP_SHOWWINDOW);
                                }
                                else
                                {
                                    SetWindowPos(hWnd, IntPtr.Zero, 100, 60, 1440, 900, SWP_NOZORDER | SWP_SHOWWINDOW);
                                }
                            }
                        }
                    }
                }
                return true;
            }, IntPtr.Zero);

            return matched;
        }

        [STAThread]
        static void Main(string[] args)
        {
            // Mode serveur intégré en arrière-plan : WireMarket.exe --server "<workDir>"
            if (args.Length >= 1 && args[0] == "--server")
            {
                string dir = args.Length >= 2 ? args[1] : AppDomain.CurrentDomain.BaseDirectory;
                RunEmbeddedServer(dir, PORT);
                return;
            }

            try
            {
                string workDir = ResolveWorkspaceDir();

                // Démarrer le serveur local intégré s'il n'est pas déjà actif
                if (!IsServerRunning())
                {
                    StartBackgroundServer(workDir);
                    for (int i = 0; i < 35; i++)
                    {
                        if (IsServerRunning()) break;
                        Thread.Sleep(150);
                    }
                }

                // Ouvrir WireMarket dans une fenêtre dédiée (--app)
                LaunchDedicatedBrowserWindow();
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    "Erreur lors du lancement de WireMarket :\n" + ex.Message,
                    "WireMarket",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }

        private static string ResolveWorkspaceDir()
        {
            string exeDir = AppDomain.CurrentDomain.BaseDirectory;
            if (File.Exists(Path.Combine(exeDir, "index.html")))
            {
                try
                {
                    Directory.CreateDirectory(Path.GetDirectoryName(ConfigFile));
                    File.WriteAllText(ConfigFile, exeDir, Encoding.UTF8);
                }
                catch { }
                return exeDir;
            }

            if (File.Exists(ConfigFile))
            {
                string saved = File.ReadAllText(ConfigFile, Encoding.UTF8).Trim();
                if (Directory.Exists(saved) && File.Exists(Path.Combine(saved, "index.html")))
                {
                    return saved;
                }
            }

            string fallback = @"c:\Users\maxim\Documents\workspace\wiremarket_v1";
            if (File.Exists(Path.Combine(fallback, "index.html")))
            {
                return fallback;
            }

            return exeDir;
        }

        private static bool IsServerRunning()
        {
            try
            {
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create(AppUrl + "/__health");
                req.Timeout = 700;
                using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
                {
                    return resp.StatusCode == HttpStatusCode.OK;
                }
            }
            catch
            {
                return false;
            }
        }

        private static void StartBackgroundServer(string workDir)
        {
            // Toujours utiliser le serveur C# natif embarqué dans WireMarket.exe
            // (Evite le bug de l'alias Microsoft Store python.exe sur les PC où Python n'est pas installé)
            ProcessStartInfo psiSelf = new ProcessStartInfo
            {
                FileName = Application.ExecutablePath,
                Arguments = "--server \"" + workDir.TrimEnd('\\') + "\"",
                WorkingDirectory = Directory.Exists(workDir) ? workDir : AppDomain.CurrentDomain.BaseDirectory,
                CreateNoWindow = true,
                UseShellExecute = false,
                WindowStyle = ProcessWindowStyle.Hidden
            };
            Process.Start(psiSelf);
        }

        private static void LaunchDedicatedBrowserWindow()
        {
            string[] candidates = new string[]
            {
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Google\Chrome\Application\chrome.exe")
            };

            string browserExe = null;
            foreach (string path in candidates)
            {
                if (File.Exists(path))
                {
                    browserExe = path;
                    break;
                }
            }

            if (browserExe != null)
            {
                string profileDir = Path.Combine(Path.GetTempPath(), "WireMarketAppProfile");
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = browserExe,
                    Arguments = "--app=\"" + AppUrl + "\" --window-size=1440,900 --user-data-dir=\"" + profileDir + "\"",
                    UseShellExecute = true
                };
                Process.Start(psi);
            }
            else
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = AppUrl,
                    UseShellExecute = true
                });
            }
        }

        /* ==================== SERVEUR HTTP + PROXY C# INTÉGRÉ ==================== */
        private static void RunEmbeddedServer(string rootDir, int port)
        {
            ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072 | (SecurityProtocolType)768; // TLS 1.2 / 1.1
            ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };
            ServicePointManager.DefaultConnectionLimit = 32;

            HttpListener listener = new HttpListener();
            listener.Prefixes.Add("http://127.0.0.1:" + port + "/");
            listener.Start();

            while (listener.IsListening)
            {
                try
                {
                    HttpListenerContext ctx = listener.GetContext();
                    ThreadPool.QueueUserWorkItem(_ => HandleRequest(ctx, rootDir));
                }
                catch { }
            }
        }

        private static void HandleRequest(HttpListenerContext ctx, string rootDir)
        {
            HttpListenerRequest req = ctx.Request;
            HttpListenerResponse resp = ctx.Response;
            try
            {
                resp.AddHeader("Access-Control-Allow-Origin", "*");
                resp.AddHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
                resp.AddHeader("Access-Control-Allow-Headers", "*");

                if (req.HttpMethod == "OPTIONS")
                {
                    resp.StatusCode = 200;
                    resp.Close();
                    return;
                }

                string path = req.Url.AbsolutePath;
                string query = req.Url.Query ?? "";

                if (path == "/__health")
                {
                    byte[] ok = Encoding.UTF8.GetBytes("{\"status\":\"ok\",\"app\":\"WireMarket\"}");
                    resp.StatusCode = 200;
                    resp.ContentType = "application/json; charset=utf-8";
                    resp.OutputStream.Write(ok, 0, ok.Length);
                    resp.Close();
                    return;
                }

                if (path == "/__window")
                {
                    int count = ApplyWindowOverlayState(query);
                    byte[] winRes = Encoding.UTF8.GetBytes("{\"status\":\"ok\",\"windowsMatched\":" + count + "}");
                    resp.StatusCode = 200;
                    resp.ContentType = "application/json; charset=utf-8";
                    resp.OutputStream.Write(winRes, 0, winRes.Length);
                    resp.Close();
                    return;
                }

                if (path == "/worldstate")
                {
                    ServeWorldstate(req, resp);
                    return;
                }

                if (path.StartsWith("/api/"))
                {
                    string target = "https://api.warframe.market" + path.Substring(4) + query;
                    ProxyUrl(target, path, req, resp, true);
                    return;
                }

                if (path.StartsWith("/assets/"))
                {
                    string target = "https://warframe.market/static/assets/" + path.Substring(8) + query;
                    ProxyUrl(target, path, req, resp, false);
                    return;
                }

                if (path == "/") path = "/index.html";
                string localPath = Path.Combine(rootDir, path.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
                if (File.Exists(localPath))
                {
                    byte[] bytes = File.ReadAllBytes(localPath);
                    resp.StatusCode = 200;
                    resp.ContentType = GetMimeType(localPath);
                    resp.OutputStream.Write(bytes, 0, bytes.Length);
                    resp.Close();
                    return;
                }

                // Fallback sur les ressources embarquées dans WireMarket.exe (si lancé directement depuis le .zip sans extraire !)
                string resName = path.TrimStart('/').Replace('/', '_');
                using (Stream resStream = Assembly.GetExecutingAssembly().GetManifestResourceStream(resName))
                {
                    if (resStream != null)
                    {
                        using (MemoryStream ms = new MemoryStream())
                        {
                            resStream.CopyTo(ms);
                            byte[] bytes = ms.ToArray();
                            resp.StatusCode = 200;
                            resp.ContentType = GetMimeType(path);
                            resp.OutputStream.Write(bytes, 0, bytes.Length);
                            resp.Close();
                            return;
                        }
                    }
                }

                resp.StatusCode = 404;
                resp.Close();
            }
            catch
            {
                try { resp.Close(); } catch { }
            }
        }

        private static void ProxyUrl(string targetUrl, string reqPath, HttpListenerRequest inReq, HttpListenerResponse outResp, bool isApi)
        {
            string lang = inReq.Headers["X-WM-Language"] ?? "fr";
            string platform = inReq.Headers["X-WM-Platform"] ?? "pc";
            string crossplay = inReq.Headers["X-WM-Crossplay"] ?? "true";
            bool forceRefresh = (inReq.Headers["X-WM-Refresh"] ?? "false") == "true";

            string cacheKey = isApi ? (targetUrl + "|" + lang + "|" + platform + "|" + crossplay) : targetUrl;
            int ttlSeconds = reqPath.StartsWith("/assets/") ? 86400 : (reqPath.Contains("/orders") ? 20 : 600);

            CacheEntry cached;
            if (!forceRefresh && ApiCache.TryGetValue(cacheKey, out cached))
            {
                if ((DateTime.UtcNow - cached.Timestamp).TotalSeconds < ttlSeconds)
                {
                    outResp.StatusCode = cached.StatusCode;
                    outResp.ContentType = cached.ContentType;
                    outResp.OutputStream.Write(cached.Body, 0, cached.Body.Length);
                    outResp.Close();
                    return;
                }
            }

            try
            {
                HttpWebRequest webReq = (HttpWebRequest)WebRequest.Create(targetUrl);
                webReq.UserAgent = "WireMarket/1.2 (Windows; Warframe Market Browser)";
                webReq.Accept = isApi ? "application/json" : "*/*";
                webReq.AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate;
                webReq.Timeout = 15000;
                if (isApi)
                {
                    webReq.Headers["Language"] = lang;
                    webReq.Headers["Platform"] = platform;
                    webReq.Headers["Crossplay"] = crossplay;
                }

                using (HttpWebResponse webResp = (HttpWebResponse)webReq.GetResponse())
                using (Stream s = webResp.GetResponseStream())
                using (MemoryStream ms = new MemoryStream())
                {
                    s.CopyTo(ms);
                    byte[] data = ms.ToArray();
                    string cType = webResp.ContentType ?? (isApi ? "application/json; charset=utf-8" : "image/png");

                    ApiCache[cacheKey] = new CacheEntry
                    {
                        Timestamp = DateTime.UtcNow,
                        StatusCode = (int)webResp.StatusCode,
                        ContentType = cType,
                        Body = data
                    };

                    outResp.StatusCode = (int)webResp.StatusCode;
                    outResp.ContentType = cType;
                    outResp.OutputStream.Write(data, 0, data.Length);
                }
            }
            catch (WebException wex)
            {
                outResp.StatusCode = 502;
                byte[] err = Encoding.UTF8.GetBytes("{\"error\":\"" + wex.Message.Replace("\"", "'") + "\"}");
                outResp.ContentType = "application/json; charset=utf-8";
                outResp.OutputStream.Write(err, 0, err.Length);
            }
            outResp.Close();
        }

        private static void ServeWorldstate(HttpListenerRequest inReq, HttpListenerResponse outResp)
        {
            bool forceRefresh = (inReq.Headers["X-WM-Refresh"] ?? "false") == "true";
            string cacheKey = "worldstate_pc_fr";
            CacheEntry cached;
            if (!forceRefresh && ApiCache.TryGetValue(cacheKey, out cached))
            {
                if ((DateTime.UtcNow - cached.Timestamp).TotalSeconds < 45)
                {
                    outResp.StatusCode = 200;
                    outResp.ContentType = "application/json; charset=utf-8";
                    outResp.OutputStream.Write(cached.Body, 0, cached.Body.Length);
                    outResp.Close();
                    return;
                }
            }

            try
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = "curl.exe",
                    Arguments = "-k -s --max-time 10 \"https://api.warframestat.us/pc/?language=fr\"",
                    CreateNoWindow = true,
                    UseShellExecute = false,
                    RedirectStandardOutput = true
                };
                using (Process p = Process.Start(psi))
                using (MemoryStream ms = new MemoryStream())
                {
                    p.StandardOutput.BaseStream.CopyTo(ms);
                    p.WaitForExit(11000);
                    byte[] data = ms.ToArray();
                    if (data.Length > 200)
                    {
                        ApiCache[cacheKey] = new CacheEntry
                        {
                            Timestamp = DateTime.UtcNow,
                            StatusCode = 200,
                            ContentType = "application/json; charset=utf-8",
                            Body = data
                        };
                        outResp.StatusCode = 200;
                        outResp.ContentType = "application/json; charset=utf-8";
                        outResp.OutputStream.Write(data, 0, data.Length);
                        outResp.Close();
                        return;
                    }
                }
            }
            catch { }

            outResp.StatusCode = 502;
            byte[] err = Encoding.UTF8.GetBytes("{\"error\":\"worldstate_unavailable\"}");
            outResp.ContentType = "application/json; charset=utf-8";
            outResp.OutputStream.Write(err, 0, err.Length);
            outResp.Close();
        }

        private static string GetMimeType(string filePath)
        {
            string ext = Path.GetExtension(filePath).ToLowerInvariant();
            if (ext == ".html") return "text/html; charset=utf-8";
            if (ext == ".css") return "text/css; charset=utf-8";
            if (ext == ".js") return "application/javascript; charset=utf-8";
            if (ext == ".png") return "image/png";
            if (ext == ".ico") return "image/x-icon";
            if (ext == ".svg") return "image/svg+xml";
            if (ext == ".mp3") return "audio/mpeg";
            return "application/octet-stream";
        }
    }
}
