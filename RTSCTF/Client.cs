using System.Html.Media.Graphics;
using System.Runtime.CompilerServices;
using RTSCTF.Utility;
using RTSCTF.Utility.UIManager;
using WebLibraries;
namespace RTSCTF
{
    public class Client
    {
        
        [IntrinsicProperty]
        public Rectangle Screen { get; set; }

        public virtual void Init(CanvasContext2D context)
        {
        }

        public virtual bool MouseMove(Pointer pointer)
        {
            return false;
        }

        public virtual bool MouseScroll(Pointer pointer)
        {
            return false;
        }

        public virtual void BuildUI(UIManager manager) { }
        public virtual void BindKeys(KeyboardJS manager) { }

        public virtual bool OnClick(Pointer pointer)
        {
            return false;
        }

        public virtual bool MouseUp(Pointer pointer)
        {
            return false;
        }

        public virtual void Resize() { }
        public virtual void Draw(CanvasContext2D context) { }
        public virtual void Tick() { }
        public virtual void GameTick() { }
    }
}