const db = require('./util/_db');
const request = require('./util/_request');
const assert = require('chai').assert;

describe('playlists api', () => {

    before(db.drop);

    it('initial /GET returns empty playlist', () => {
        return request
            .get('/playlists')
            .then(res => {
                const playlists = res.body;
                assert.deepEqual(playlists, []);
            });
    });

    let fakePlaylist1 = {
        title: 'fake Playlist 1',
        songs: [{ title: 'halo', artist: 'Beyonce', spotifyId: '5DGJC3n9DS0Y9eY5ul8y0O' }, { title: 'Lame Song', artist: 'Train', spotifyId: '5DGJC3n9DS0Y9eY5ul9y0O' }],
        
    };
    let fakePlaylist2 = {
        title: 'fake Playlist 2',
        songs: [{ title: 'halo', artist: 'Beyonce', spotifyId: '5DGJC3n7DS0Y9eY5ul9y0O' }, { title: 'Lust', artist: 'Kendrick Lamar',  spotifyId: '5DGJC3n9DS0T9eY5ul9y0O' }],
       
    };
    let fakePlaylist3 = {
        title: 'fake Playlist 3',
        songs: [{ title: 'Lame Song', artist: 'Train', spotifyId: '5DGJD3n9DS0Y9eY5ul9y0O' }, { title: 'Lust', artist: 'Kendrick Lamar',  spotifyId: '5DGJC3n9DS0K9eY5ul9y0O' }],
       
    };

    function savePlaylist(playlist) {
        return request
            .post('/playlists')
            .send(playlist)
            .then(res => res.body);
    }

    it('rountrips a new playlist', () => {
        return savePlaylist(fakePlaylist1)
            .then(savedPlaylist => {
                assert.ok(savedPlaylist._id, 'saved has id');
                fakePlaylist1 = savedPlaylist;
            })
            .then(() => {
                return request.get(`/playlists/${fakePlaylist1._id}`);
            })
            .then(res => res.body)
            .then(gotPlaylist => {
                assert.deepEqual(gotPlaylist, fakePlaylist1);
            });
    });

    it('GET returns 404 for non-existent id', () => {
        const fakeId = '5201103b8896909da4402997';
        return request.get(`/playlists/${fakeId}`)
            .then(
            () => { throw new Error('expected 404'); },
            res => {
                assert.equal(res.status, 404);
            }
            );
    });

    it('returns list of all playlists', () => {
        return Promise.all([
            savePlaylist(fakePlaylist2),
            savePlaylist(fakePlaylist3)
        ])
            .then(savedPlaylist => {
                fakePlaylist2 = savedPlaylist[0];
                fakePlaylist3 = savedPlaylist[1];
            })
            .then(() => request.get('/playlists'))
            .then(res => res.body)
            .then(playlists => {
                console.log('PLAYLISTS', playlists);
                assert.equal(playlists.length, 3);
                function test(fakePlaylist) {
                    assert.include(playlists, {
                        title: fakePlaylist.title,
                        songs: fakePlaylist.songs,
                        _id: fakePlaylist._id,
                    });
                }
                test(fakePlaylist1);
                test(fakePlaylist2);
                test(fakePlaylist3);
            });
    });
});
