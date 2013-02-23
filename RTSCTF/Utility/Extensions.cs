using System;
using System.Collections.Generic;
using System.Html;
using System.Runtime.CompilerServices;
using jQueryApi;
namespace RTSCTF.Utility
{
    public static class Extensions
    {
        [InlineCode("{o}")]
        public static dynamic Me(this object o)
        {
            return o;
        }

        public static void AddEvent(this Element element, string eventName, ElementEventListener listener)
        {
            if (element.Me().addEventListener != null) {
                element.AddEventListener(eventName, listener, false);
            } else {
                element.AttachEvent(eventName,() => listener(Window.Event));
            }

        }


        [InlineCode("{o}")]
        public static bool Truthy(this object o)
        {
            return o != null;
        }

        [InlineCode("!{o}")]
        public static bool Falsey(this object o)
        {
            return o == null;
        }
        [InlineCode("{o}")]
        [IgnoreGenericArguments]
        public static T Me<T>(this object o)
        {
            return default( T );
        }

        [InlineCode("{o}")]
        [IgnoreGenericArguments]
        public static T[] Array<T>(this List<T> o)
        {
            return new T[0];
        }

        public static List<T> TakeRandom<T>(this List<T> items)
        {
            var ls = new List<T>(items);

            ls.Sort((a, b) => { return (int) ( Math.Round(Math.Random()) - 0.5 ); });
            return ls;
         }

        public static ExtraData<T, T2> WithData<T, T2>(this T item, T2 data)
        {
            return new ExtraData<T, T2>(item, data);
        }

        public static string Percent(this int num)
        {
            return num + "%";
        }

        public static string Percent(this double num)
        {
            return num + "%";
        }
    }
}