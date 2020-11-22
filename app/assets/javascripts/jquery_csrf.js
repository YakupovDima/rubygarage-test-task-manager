$(function(){
    // always pass csrf tokens on ajax calls
    $.ajaxSetup({
        headers: { 'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content') }
    });
});