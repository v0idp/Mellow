-- Up
CREATE TABLE general (id integer primary key asc, username text, password text);
CREATE TABLE bot (id integer primary key asc, token text, ownerid text, commandprefix text, deletecommandmessages text, unknowncommandresponse text);
CREATE TABLE ombi (id integer primary key asc, host text, port text, apikey text, requesttv text, requestmovie text);
CREATE TABLE tautulli (id integer primary key asc, host text, port text, apikey text);
CREATE TABLE sonarr (id integer primary key asc, host text, port text, apikey text);
CREATE TABLE radarr (id integer primary key asc, host text, port text, apikey text);

-- Down
DROP TABLE general;
DROP TABLE bot;
DROP TABLE ombi;
DROP TABLE tautulli;
DROP TABLE sonarr;
DROP TABLE radarr;
