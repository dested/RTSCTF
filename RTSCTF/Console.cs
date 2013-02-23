using System.Runtime.CompilerServices;
namespace RTSCTF
{
    [ScriptName("console")]
    [Imported,IgnoreNamespace]
    public class Console
    {
        [ScriptName("log")]
        public static void Log(string l) {}
    }
}