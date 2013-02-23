using System.Runtime.CompilerServices;
namespace Isos
{
    [ScriptName("console")]
    [Imported,IgnoreNamespace]
    public class Console
    {
        [ScriptName("log")]
        public static void Log(string l) {}
    }
}