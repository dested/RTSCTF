using System.Html.Media.Graphics;
using System.Runtime.CompilerServices;
using RTSCTF.Utility;
using RTSCTF.Utility.UIManager;
using WebLibraries;
namespace RTSCTF
{
    public class MainGameManager
    {
        private  Client game;  
        [IntrinsicProperty]
        public Rectangle Screen { get; set; }

        public MainGameManager()
        { 
            game = new  Game();
            // game = new Game(); 
            // game = new ZakGame.Client.Game();
            Screen = new Rectangle(0, 0, 0, 0);
        }

        public bool MouseMove(Pointer queryEvent)
        {
            return game.MouseMove(queryEvent);
        }

        public void BuildUI(UIManager uiManager)
        {
            game.BuildUI(uiManager);
        }

        public bool OnClick(Pointer queryEvent)
        {
            return game.OnClick(queryEvent);
        }

        public bool MouseUp(Pointer queryEvent)
        {
            return game.MouseUp(queryEvent);
        }

        public void Draw(CanvasContext2D context)
        {
            game.Draw(context);
        }

        public void Tick()
        {
            game.Tick();
        }

        public void Start(CanvasContext2D context)
        {
            game.Screen = Screen;
            game.Init( context);
            game.BindKeys(KeyboardJS.Instance());
        }

        public void GameTick()
        {
            game.GameTick();
        }
    }
}