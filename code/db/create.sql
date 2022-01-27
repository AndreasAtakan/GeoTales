/*******************************************************************************
* Copyright (C) Nordfjord EDB AS - All Rights Reserved                         *
*                                                                              *
* Unauthorized copying of this file, via any medium is strictly prohibited     *
* Proprietary and confidential                                                 *
* Written by Andreas Atakan <aca@tellusmap.com>, January 2022                  *
*******************************************************************************/

BEGIN;
CREATE TABLE IF NOT EXISTS "User"(
	uid int NOT NULL,
	paid bool DEFAULT false,
	payment text,

	PRIMARY KEY (uid)
);
END;

--

BEGIN;
CREATE TABLE IF NOT EXISTS "Map"(
	id serial,
	title varchar(65) NOT NULL,
	description text,
	created timestamp DEFAULT NOW(),
	post text,
	preview text,
	data json,

	PRIMARY KEY (id)
);
END;

--

BEGIN;
CREATE TABLE IF NOT EXISTS "User_Map"(
	id serial,
	user_id serial NOT NULL,
	map_id serial NOT NULL,
	status varchar(100) NOT NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (user_id)
		REFERENCES "User" (uid)
		ON DELETE CASCADE
		ON UPDATE CASCADE,
	FOREIGN KEY (map_id)
		REFERENCES "Map" (id)
		ON DELETE CASCADE
		ON UPDATE CASCADE
);
END;
