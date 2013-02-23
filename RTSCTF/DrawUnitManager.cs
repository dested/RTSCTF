using System.Html.Media.Graphics;
namespace RTSCTF
{
    public class DrawUnitManager : UnitManager
    {
        public DrawUnitManager(GameManager gameManager)
                : base(gameManager) {}

        public void Draw(CanvasContext2D context)
        {
            MainCharacter.Draw(context);
        }
    }
}