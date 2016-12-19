<!DOCTYPE html>
<html>
<head>
    <title>MPD All Access</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script type="text/javascript" charset="utf8" src="//code.jquery.com/jquery-1.12.3.js"></script>
    <script type="text/javascript" charset="utf8" src="//cdn.datatables.net/1.10.12/js/jquery.dataTables.min.js"></script>
    <script src="https://swisnl.github.io/jQuery-contextMenu/dist/jquery.contextMenu.js" type="text/javascript"></script>
    <script src="https://use.fontawesome.com/2f2f714e84.js"></script>
    <script type="text/javascript" charset="utf8" src="js/scripts.js"></script>
    <script type="text/javascript" charset="utf8" src="js/notify.min.js"></script>
    <link href="https://swisnl.github.io/jQuery-contextMenu/dist/jquery.contextMenu.css" rel="stylesheet" type="text/css" />
    <link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.12/css/jquery.dataTables.min.css">
    <link rel="stylesheet" type="text/css" href="css/style.css">
    <link href="https://fonts.googleapis.com/css?family=Gentium+Basic" rel="stylesheet">
</head>
<body>

<div class="frm">
	<span class="title"><span>g</span><i class="fa fa-music" aria-hidden="true"></i></span>
    <form id="search" action="" method="get">
        <input type="text" name="q" value="" placeholder="Search"/>
        <button type="submit"><i class="fa fa-search" aria-hidden="true"></i></button>
    </form>
    <div style="clear:both;"></div>
</div>

<div class="o">
</div>

<div class="t">
    <button class="track" data-mode="add" disabled>Add</button>
    <button class="track" data-mode="play" disabled>Play</button>
    <button id="select">Select All</button>
</div>

{{>search}}

</body>
</html>
