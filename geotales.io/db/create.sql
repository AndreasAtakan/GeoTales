/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@geotales.io>, January 2022                  *
*******************************************************************************/

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

BEGIN;
CREATE TABLE IF NOT EXISTS "User"(
	id uuid DEFAULT uuid_generate_v4(),
	username text NOT NULL,
	password varchar(64) NOT NULL,
	email text,
	photo text,
	paid bool DEFAULT false,
	stripe_id text,
	PRIMARY KEY (id)
);
END;

--

BEGIN;
CREATE TABLE IF NOT EXISTS "Map"(
	id uuid DEFAULT uuid_generate_v4(),
	title text NOT NULL,
	description text,
	thumbnail text,
	data json,
	password varchar(64),
	created_date timestamp DEFAULT NOW(),
	published_date timestamp,
	views int DEFAULT 0,
	likes int DEFAULT 0,
	flags int DEFAULT 0,
	PRIMARY KEY (id)
);
END;

--

BEGIN;
CREATE TABLE IF NOT EXISTS "User_Map"(
	id uuid DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL,
	map_id uuid NOT NULL,
	status text NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (user_id) REFERENCES "User" (id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (map_id) REFERENCES "Map" (id) ON DELETE CASCADE ON UPDATE CASCADE
);
END;

--

BEGIN;
CREATE TABLE IF NOT EXISTS "Comment"(
	id uuid DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL,
	map_id uuid NOT NULL,
	ref uuid,
	content text,
	created_date timestamp DEFAULT NOW(),
	PRIMARY KEY (id),
	FOREIGN KEY (user_id) REFERENCES "User" (id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (map_id) REFERENCES "Map" (id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (ref) REFERENCES "Comment" (id) ON DELETE CASCADE ON UPDATE CASCADE
);
END;

--

BEGIN;
CREATE TABLE IF NOT EXISTS "Upload"(
	id uuid DEFAULT uuid_generate_v4(),
	ref text,
	PRIMARY KEY (id)
);
END;

--

BEGIN;
CREATE TABLE IF NOT EXISTS "User_Upload"(
	id uuid DEFAULT uuid_generate_v4(),
	user_id uuid NOT NULL,
	upload_id uuid NOT NULL,
	type text NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (user_id) REFERENCES "User" (id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (upload_id) REFERENCES "Upload" (id) ON DELETE CASCADE ON UPDATE CASCADE
);
END;
