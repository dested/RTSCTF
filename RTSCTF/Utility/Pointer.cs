using System;
using jQueryApi;
namespace RTSCTF.Utility
{
    [Serializable]
    public class Pointer : Point
    {
        public int Delta { get; set; }
        public bool Right { get; set; }

        public Pointer(int x, int y, int delta = 0, bool right = false)
                : base(x, y)
        {
            Delta = delta;
            Right = right;
        }
        public static Pointer GetPointer(jQueryEvent ev)
        {
            if (ev.Me().originalEvent && ev.Me().originalEvent.targetTouches && ev.Me().originalEvent.targetTouches.length > 0) ev = ev.Me().originalEvent.targetTouches[0];

            if (ev.PageX.Me() != null && ev.PageY.Me() != null)
                return new Pointer(ev.PageX, ev.PageY, 0, ev.Which == 3);
            //if (ev.x != null && ev.y != null) return new { x: ev.x, y: ev.y };
            return new Pointer(ev.ClientX, ev.ClientY, 0, ev.Which == 3);
        }
    }
}