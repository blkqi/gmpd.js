$(document).ready(function(){

	var context_menu_items = new Array();
    if ( $( window ).width() < 600 ) {
        context_menu_items = {
            "album-add": {name: "Add Album", icon: "add"},
            "album-play": {name: "Play Album", icon: "fa-play"},
            "track-add": {name: "Add Track", icon: "add"},
            "track-play": {name: "Play Track", icon: "fa-play"},
            "radio-play": {name: "Play Radio", icon: "fa-feed"}
        }
        $(".btn.track").hide();
    }
    else {
        context_menu_items = {
            "album-add": {name: "Add Album", icon: "add"},
            "album-play": {name: "Play Album", icon: "fa-play"},
            "radio-play": {name: "Play Radio", icon: "fa-feed"}
        }
        $(".btn.track").show();
    }
    $(window).on('resize', function(){
    if ( $( window ).width() < 600 ) {
        context_menu_items = {
            "album-add": {name: "Add Album", icon: "add"},
            "album-play": {name: "Play Album", icon: "fa-play"},
            "track-add": {name: "Add Track", icon: "add"},
            "track-play": {name: "Play Track", icon: "fa-play"},
            "radio-play": {name: "Play Radio", icon: "fa-feed"}
        }
        $(".btn.track").hide();
    }
    else {
        context_menu_items = {
            "album-add": {name: "Add Album", icon: "add"},
            "album-play": {name: "Play Album", icon: "fa-play"},
            "radio-play": {name: "Play Radio", icon: "fa-feed"}
        }
        $(".btn.track").show();
    }
	});

    $.contextMenu({
        selector: '.context-menu-one', 
        trigger: 'left',
    	callback: function(key, opt){ 
    	    var tracks = new Array();
    	    tracks.push(opt.$trigger.attr("data-track"));
      		var data = {
       		  "mode": key.split('-')[1],
       		  "type": key.split('-')[0],
       		  "id": opt.$trigger.attr("data-id"), //remove - this is redundant with album id
       		  "album": opt.$trigger.attr("data-album"),
       		  "artist": opt.$trigger.attr("data-artist"),
       		  "track": tracks
      		};
      		$.post("load", data, function(data, status){
          		$.notify(data,"success");
      		});
        },
        items: context_menu_items
    });

    $('.btn.track').click( function () {
      var mode = $(this).attr('data-mode');
      var tracks = new Array();
      tracks.push($(this).attr('data-track'));
      var data = {
        "mode": mode,
        "type": "track",
        "track": tracks,
        "id": null
      };
      $.post("load", data, function(data, status){
          $.notify(data,"success");
          $('#table tbody tr').removeClass('selected');
          $('#table tbody tr td.num img').attr('src','img/unchecked.png');
      });
    });
    
    $('div.frm input').focus(function(){
    	$(this).select();
	});
    
    $("form#search input").val($.urlParam('q'));

    var width = $(window).width();
    $('#table').width(width);

});

$(window).resize(function() {
  var width = $(window).width();
  $('#table').width(width);
});

$.urlParam = function (name) {
  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
  return results ? results[1] : '';
}
