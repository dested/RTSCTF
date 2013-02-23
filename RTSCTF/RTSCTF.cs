using System;
using System.Collections.Generic;
using System.Html;
using System.Text;
using RTSCTF.Utility;
using jQueryApi;
namespace RTSCTF
{
    public class RTSCTF
    {
        private CanvasInformation myCanvas;
        private Game myGame;

        public RTSCTF()
        {
           myCanvas= CanvasInformation.Create((CanvasElement)Document.GetElementById("gameLayer"), jQuery.Window.GetWidth(), jQuery.Window.GetHeight());

            myGame = new Game(myCanvas);


            myCanvas.JElement.MouseDown(canvasOnClick);
            myCanvas.JElement.MouseUp(canvasMouseUp);
            myCanvas.JElement.MouseMove(canvasMouseMove);
             
            myCanvas.JElement.Bind("touchstart", canvasOnClick);
            myCanvas.JElement.Bind("touchend", canvasMouseUp);
            myCanvas.JElement.Bind("touchmove", canvasMouseMove);
              
         //   myCanvas.JElement.Bind("contextmenu", (e) => e.PreventDefault());

        }

        private void canvasMouseMove(jQueryEvent e)
        {

            myGame.MouseMove(Pointer.GetPointer(e));
        }

        private void canvasMouseUp(jQueryEvent e)
        {
            myGame.MouseUp(Pointer.GetPointer(e));
   }

        private void canvasOnClick(jQueryEvent e)
        {
            myGame.MouseDown(Pointer.GetPointer(e));
        }

        public static void Main()
        {
            jQuery.OnDocumentReady(() => new RTSCTF());
        }
    }
}
