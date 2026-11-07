using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Threading;
using System.Windows.Forms;

namespace WireMarketLauncher
{
    static class Program
    {
        private const int PORT = 8484;
        private static readonly string AppUrl = "http://127.0.0.1:" + PORT;
        private static readonly string DefaultWorkspaceDir = @"c:\Users\maxim\Documents\workspace\wiremarket_v1";

        [STAThread]
        static void Main()
        {
            try
            {
                string workDir = ResolveWorkspaceDir();
                string serverScript = Path.Combine(workDir, "server.py");

                if (!File.Exists(serverScript))
                {
                    MessageBox.Show(
                        "Impossible de trouver server.py dans :\n" + workDir,
                        "WireMarket - Erreur",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                    return;
                }

                // 1. Démarrer le serveur local en arrière-plan (sans fenêtre console noire) s'il n'est pas déjà actif
                if (!IsServerRunning())
                {
                    StartHiddenServer(workDir, serverScript);
                    for (int i = 0; i < 30; i++)
                    {
                        if (IsServerRunning()) break;
                        Thread.Sleep(200);
                    }
                }

                // 2. Ouvrir WireMarket dans une fenêtre d'application dédiée (--app)
                LaunchDedicatedBrowserWindow(workDir);
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
            if (File.Exists(Path.Combine(exeDir, "server.py")))
            {
                return exeDir;
            }
            return DefaultWorkspaceDir;
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

        private static void StartHiddenServer(string workDir, string serverScript)
        {
            ProcessStartInfo psi = new ProcessStartInfo
            {
                FileName = "python",
                Arguments = "\"" + serverScript + "\" " + PORT,
                WorkingDirectory = workDir,
                CreateNoWindow = true,
                UseShellExecute = false,
                WindowStyle = ProcessWindowStyle.Hidden
            };
            Process.Start(psi);
        }

        private static void LaunchDedicatedBrowserWindow(string workDir)
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
    }
}

