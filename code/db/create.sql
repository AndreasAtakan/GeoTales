/**/

BEGIN;
CREATE TABLE IF NOT EXISTS "User"(
	uid int NOT NULL,
	username varchar(45) NOT NULL,
	payment text,

	PRIMARY KEY (uid)
);
END;

--

BEGIN;
CREATE TABLE IF NOT EXISTS "Project"(
	pid serial,
	title varchar(65) NOT NULL,
	description text,
	created timestamp DEFAULT NOW(),
	data json NOT NULL,

	PRIMARY KEY (pid)
);
END;

--

BEGIN;
CREATE TABLE IF NOT EXISTS "User_Project"(
	id serial,
	uid serial NOT NULL,
	pid serial NOT NULL,
	status varchar(100) NOT NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (uid)
		REFERENCES "User" (uid)
		ON DELETE CASCADE
		ON UPDATE CASCADE,
	FOREIGN KEY (pid)
		REFERENCES "Project" (pid)
		ON DELETE CASCADE
		ON UPDATE CASCADE
);
END;

--

BEGIN;
CREATE TABLE IF NOT EXISTS "Public"(
	id serial,
	pid serial NOT NULL,
	url text NOT NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (pid)
		REFERENCES "Project" (pid)
		ON DELETE CASCADE
		ON UPDATE CASCADE
);
END;
