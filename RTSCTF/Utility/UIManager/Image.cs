using System;
using System.Html.Media.Graphics;
using System.Runtime.CompilerServices;
namespace RTSCTF.Utility.UIManager
{
    public class Image<T> : Image
    {
        [IntrinsicProperty]
        public T Data { get; set; }

        public Image(T data, int x, int y, int width, int height) : base(x, y, width, height)
        {
            Data = data;
        }
    }
    public class Image : Element
    {
        [IntrinsicProperty]
        public Action<CanvasContext2D, int, int> OnDraw { get; set; }

        public Image(int x, int y, int width, int height)
                : base(x, y)
        {
            OnDraw = null;

            Width = width;
            Height = height;
        }

        public override void Construct()
        {
            base.Construct();
        }

        public override bool OnClick(Pointer e)
        {
            if (!Visible)
                return false; 
            if (Click != null)
                Click(e);

            return base.OnClick(e);
        }

        public override bool OnMouseUp(Pointer e)
        {
            if (!Visible)
                return false;
            return base.OnMouseUp(e);
        }

        public override bool OnMouseOver(Pointer e)
        {
            if (!Visible) return false;
            return base.OnMouseOver(e);
        }

        public override void Draw(CanvasContext2D canv)
        {
            if (!Visible) return;

            canv.Save();

            canv.LineWidth = 2;
            CHelp.RoundRect(canv, TotalX, TotalY, Width, Height, 2, true, true);
            canv.FillStyle = "#000000";

            OnDraw(canv, TotalX, TotalY);

            canv.Restore();
        }
    }
}