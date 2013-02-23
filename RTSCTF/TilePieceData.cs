using System;
namespace RTSCTF
{
    [Serializable]
    public class TilePieceData
    {
        public int X { get; set; }
        public int Y { get; set; }
        public int TileX { get; set; }
        public int TileY { get; set; }
        public string TileKey { get; set; }

    }
}