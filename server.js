var express = require('express');
var fs = require('fs');
var url = require('url');
var https = require('https');
var bodyParser = require('body-parser');
var tmp = require('tmp');
var mpd = require('mpd');
var PlayMusic = require('playmusic');
var id3 = require('node-id3');

// Config setup

var config = require('./config.json');
var max_results = config.max_results || 25;
var listen_port = config.listen_port || 3000;
var server_timeout = config.server_timeout || 600000;

// PlayMusic setup

var pm = new PlayMusic();

var pmlogin = new Object();
pm.login(config.gmp, function(err, msg) {
    if (err) console.error(err);
    if (msg) {
      pm.init(msg, function(err) {
          if (err) throw err;
      });
    }
})

// MPD setup

var mpc = mpd.connect(config.mpd);

function mpc_clear_cmd() { return mpd.cmd('clear', []) };
function mpc_play_cmd() { return mpd.cmd('play', []) };
function mpc_load_cmd(url) { return mpd.cmd('add', [url]) };

function mpc_callback(err, msg) {
    if (err) throw err;
    if (msg) console.log(msg);
}

function mpc_add_track(urls, play) {
    if (play) mpc.sendCommand(mpc_clear_cmd(), mpc_callback);
    urls.map(function(url) { mpc.sendCommand(mpc_load_cmd(url), mpc_callback) });
    if (play) mpc.sendCommand(mpc_play_cmd(), mpc_callback);
}

// Express setup

var app = express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

function pass_through(res) {
    return function(err, data) { res.status(200).send(data); }
}

app.get('/api', function(_req, _res) {
    switch (_req.query.q) {
        case ".lib":
            pm.getAllTracks(function(err, data) {
                data.tracks = data.data.items;
                delete data.data;
                _res.status(200).send(data);
            });
            return;
        default:
            pm.search(_req.query.q, max_results, pass_through(_res));
            return;
    }
});

app.get('/api/artist', function(_req, _res) {
    if (_req.query.id) pm.getArtist(_req.query.id, true, max_results, 0, pass_through(_res));
});

app.get('/api/album', function(_req, _res) {
    if (_req.query.id) pm.getAlbum(_req.query.id, true, pass_through(_res));
});

app.get('/api/station', function(_req, _res) {
    if (_req.query.id) pm.getStationTracks(_req.query.id, true, pass_through(_res));
});

function id3_wrapper(id, callback) {
    pm.getAllAccessTrack(id, function(err, track) {
        var tags = {
            'artist' : track.artist,
            'album' : track.album,
            'title' : track.title,
            //'year' : track.year
        };
        tmp.file(function(err, path, fd) {
            if (err) throw err;
            var sts = id3.write(tags, path);
            callback(sts, fs.readFileSync(path));
        });
    });
}

app.get('/play.mp3', function(_req, _res) {
    if (_req.query.id) {
        pm.getStreamUrl(_req.query.id, function(err, url) {
            https.get(url, function(res) {
                _res.status(res.statusCode);
                if (res.statusCode === 200) {
                    id3_wrapper(_req.query.id, function(sts, data) {
                        if (sts) _res.write(data);
                        res.on('data', function(chunk) { _res.write(chunk) });
                        res.on('end', function() { _res.send(); });
                    });
                }
                else _res.end();
            });
        });
    }
    else _res.status(400).end();
});

function url_ids(req, ids) {
    return ids.map(function(id) {
        return url.format({
            'protocol': req.protocol,
            'hostname': req.hostname,
            'port': listen_port,
            'pathname': 'play.mp3',
            'query': {id: id}
        });
    });
}

function load_track(_req) {
    mpc_add_track(url_ids(_req, [_req.body.id]), _req.body.mode==='play');
}

function load_radio(_req) {
    pm.createStation('radio:' + _req.body.id, _req.body.id, "track", function(err, body) {
        pm.getStationTracks(body.mutate_response[0].id, max_results, function(err, data) {
            var ids = data.data.stations[0].tracks.map(function(track) { return track.nid; });
            mpc_add_track(url_ids(_req, ids), true)
        });
    });
}

function load_album(_req) {
    pm.getAlbum(_req.body.id, true, function(err, data) {
        var ids = data.tracks.map(function(track) { return track.nid; });
        mpc_add_track(url_ids(_req, ids), _req.body.mode==='play')
    });
}

app.post('/api/:type', function(_req, _res) {
    switch (_req.params.type) {
        case "track": load_track(_req); break;
        case "radio": load_radio(_req); break;
        case "album": load_album(_req); break;
        default: _res.status(400).end(); return;
    }
    _res.status(202).end();
});

var server = app.listen(listen_port, function() {
    var host = server.address().address
    var port = server.address().port
    console.log('gmpd listening at http://%s:%s', host, port)
});
server.setTimeout(server_timeout, function(msg) { console.log("timeout:", msg) } );

['SIGINT', 'SIGTERM'].map(function(x) { process.on(x, process.exit) });
