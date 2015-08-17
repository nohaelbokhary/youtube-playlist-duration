// ==UserScript==
// @name        YouTube playlist duration
// @description Shows the total runtime for a YouTube playlist
// @version     1.0.0
// @match       https://www.youtube.com/playlist*
// @grant       none
// @require     http://code.jquery.com/jquery-latest.js
// ==/UserScript==
(function($) {
    'use strict';

    /**
     * Debounce function via David Walsh
     * http://davidwalsh.name/javascript-debounce-function
     *
     * Returns a function, that, as long as it continues to be invoked, will not
     * be triggered. The function will be called after it stops being called for
     * N milliseconds. If `immediate` is passed, trigger the function on the
     * leading edge, instead of the trailing.
     */
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    var playlistLength = -1;
    var time = {
        h: 0,
        m: 0,
        s: 0
    };

    function getPlaylistLength() {
        return $('#pl-load-more-destination tr').length;
    }

    function getPlaylistTimestamps() {
        return $('#pl-load-more-destination tr .timestamp span');
    }

    function updateTotalTime() {
        var len = getPlaylistLength();
        if (len === playlistLength) {
            return;
        }

        playlistLength = len;
        time = {
            h: 0,
            m: 0,
            s: 0
        };

        var timestamps = getPlaylistTimestamps();
        timestamps.each(function(){
            var t = $(this).text().split(':');

            var seconds = parseInt(t.pop(), 10) || 0;
            var minutes = parseInt(t.pop(), 10) || 0;
            var hours   = parseInt(t.pop(), 10) || 0;

            time.h += hours;
            time.m += minutes;
            time.s += seconds;
        });

        time.m += Math.floor(time.s / 60);
        time.s = time.s % 60;

        time.h += Math.floor(time.m / 60);
        time.m = time.m % 60;

        $('#pl-total-time').remove();

        var h = (time.h > 0) ? time.h + ':' : '';
        var m = (time.m > 0) ? time.m + ':' : '0:';
        var s = (time.s > 0) ? ((time.s < 10) ? '0' + time.s : time.s) : '00';

        $('#pl-header .pl-header-content .pl-header-details li:nth-child(2)').after('<li id="pl-total-time">' + h + m + s + '</li>');
    }

    $(document).ready(function(){
        var safeUpdate = debounce(updateTotalTime, 250, true);
        var tbody = document.getElementById('pl-load-more-destination');

        updateTotalTime();
        tbody.addEventListener('DOMNodeInserted', safeUpdate);
    });
}(jQuery));