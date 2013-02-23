using System;
using RTSCTF.Utility;
namespace RTSCTF
{
    [Serializable]
    public class Rectangle : Point
    {
        public int Width { get; set; }
        public int Height { get; set; }
        public Rectangle() : base(0, 0) { }

        public Rectangle(int x, int y, int width, int height)
                : base(x, y)
        {
            Width = width;
            Height = height;
        }
    }
}