using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Windows.Forms;

[assembly: AssemblyTitle("WireMarket")]
[assembly: AssemblyDescription("Navigateur Warframe Market - Fait par Nyxo_17")]
[assembly: AssemblyCompany("Nyxo_17")]
[assembly: AssemblyProduct("WireMarket (Fait par Nyxo_17)")]
[assembly: AssemblyCopyright("Copyright © Nyxo_17")]
[assembly: AssemblyVersion("1.0.0.0")]
[assembly: AssemblyFileVersion("1.0.0.0")]

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

        [STAThread]
        static void Main(string[] args)
        {
            // Mode serveur intégré en arrière-plan : WireMarket.exe --server "<workDir>"
            if (args.Length >= 2 && args[0] == "--server")
            {
                RunEmbeddedServer(args[1], PORT);
                return;
            }

            try
            {
                string workDir = ResolveWorkspaceDir();
                if (workDir == null || !File.Exists(Path.Combine(workDir, "index.html")))
                {
                    MessageBox.Show(
                        "Impossible de trouver les fichiers de WireMarket (index.html).\n" +
                        "Lancez d'abord WireMarket.exe une première fois depuis son dossier d'installation.",
                        "WireMarket - Dossier introuvable",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Warning
                    );
                    return;
                }

                // Démarrer le serveur local s'il n'est pas déjà actif
                if (!IsServerRunning())
                {
                    StartBackgroundServer(workDir);
                    for (int i = 0; i < 30; i++)
                    {
                        if (IsServerRunning()) break;
                        Thread.Sleep(200);
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
            return null;
        }

        private static bool IsServerRunning()
        {
            try
            {
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create(AppUrl + "/__health");
                req.Timeout = 800;
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
            string serverPy = Path.Combine(workDir, "server.py");
            if (File.Exists(serverPy) && IsPythonAvailable())
            {
                ProcessStartInfo psiPy = new ProcessStartInfo
                {
                    FileName = "python",
                    Arguments = "\"" + serverPy + "\" " + PORT,
                    WorkingDirectory = workDir,
                    CreateNoWindow = true,
                    UseShellExecute = false,
                    WindowStyle = ProcessWindowStyle.Hidden
                };
                Process.Start(psiPy);
                return;
            }

            // Fallback autonome C# (fonctionne même sur un PC sans Python installé !)
            ProcessStartInfo psiSelf = new ProcessStartInfo
            {
                FileName = Application.ExecutablePath,
                Arguments = "--server \"" + workDir + "\"",
                WorkingDirectory = workDir,
                CreateNoWindow = true,
                UseShellExecute = false,
                WindowStyle = ProcessWindowStyle.Hidden
            };
            Process.Start(psiSelf);
        }

        private static bool IsPythonAvailable()
        {
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = "python",
                    Arguments = "--version",
                    CreateNoWindow = true,
                    UseShellExecute = false
                };
                using (Process p = Process.Start(psi))
                {
                    p.WaitForExit(1500);
                    return p.ExitCode == 0;
                }
            }
            catch
            {
                return false;
            }
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

        /* ==================== SERVEUR HTTP + PROXY C# INTÉGRÉ (SANS PYTHON) ==================== */
        private static void RunEmbeddedServer(string rootDir, int port)
        {
            ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072; // TLS 1.2
            ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };

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

                if (path.StartsWith("/api/"))
                {
                    string target = "https://api.warframe.market" + path.Substring(4) + query;
                    ProxyUrl(target, req, resp, true);
                    return;
                }

                if (path.StartsWith("/assets/"))
                {
                    string target = "https://warframe.market/static/assets/" + path.Substring(8) + query;
                    ProxyUrl(target, req, resp, false);
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
                }
                else
                {
                    resp.StatusCode = 404;
                }
                resp.Close();
            }
            catch
            {
                try { resp.Close(); } catch { }
            }
        }

        private static void ProxyUrl(string targetUrl, HttpListenerRequest inReq, HttpListenerResponse outResp, bool isApi)
        {
            try
            {
                HttpWebRequest webReq = (HttpWebRequest)WebRequest.Create(targetUrl);
                webReq.UserAgent = "WireMarket/1.0";
                webReq.Accept = isApi ? "application/json" : "*/*";
                webReq.Timeout = 15000;
                if (isApi)
                {
                    webReq.Headers["Language"] = inReq.Headers["X-WM-Language"] ?? "fr";
                    webReq.Headers["Platform"] = inReq.Headers["X-WM-Platform"] ?? "pc";
                    webReq.Headers["Crossplay"] = inReq.Headers["X-WM-Crossplay"] ?? "true";
                }

                using (HttpWebResponse webResp = (HttpWebResponse)webReq.GetResponse())
                using (Stream s = webResp.GetResponseStream())
                using (MemoryStream ms = new MemoryStream())
                {
                    s.CopyTo(ms);
                    byte[] data = ms.ToArray();
                    outResp.StatusCode = (int)webResp.StatusCode;
                    outResp.ContentType = webResp.ContentType ?? "application/json; charset=utf-8";
                    outResp.AddHeader("Access-Control-Allow-Origin", "*");
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

        private static string GetMimeType(string filePath)
        {
            string ext = Path.GetExtension(filePath).ToLowerInvariant();
            if (ext == ".html") return "text/html; charset=utf-8";
            if (ext == ".css") return "text/css; charset=utf-8";
            if (ext == ".js") return "application/javascript; charset=utf-8";
            if (ext == ".png") return "image/png";
            if (ext == ".ico") return "image/x-icon";
            if (ext == ".svg") return "image/svg+xml";
            return "application/octet-stream";
        }
    }
}
