using System.Html;
using System.Runtime.CompilerServices;
using RTSCTF.Utility;
namespace RTSCTF
{
    public class Game
    {
        private readonly CanvasInformation myCanvas;
        private GameMap map ;

        public Game(CanvasInformation canvas)
        {
            myCanvas = canvas;

            Window.SetInterval(draw, 1000 / 60);
            Window.SetInterval(tick, 1000 / 60);

            map = new GameMap();
        }

        public void MouseMove(Pointer pointer)
        { 
        }

        public void MouseUp(Pointer pointer)
        { 
        }

        public void MouseDown(Pointer pointer)
        { 
        }

        private void draw()
        {
        

        }

        private void tick()
        { 
        }
    }
    public class GameMap
    {
        [IntrinsicProperty]
        public Point Position { get; set; }

        public void Draw()
        {
            
        }
    }
}