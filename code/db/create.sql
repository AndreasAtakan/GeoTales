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
CREATE TABLE IF NOT EXISTS "Tag"(
	id serial,
	name varchar(65) NOT NULL,
	PRIMARY KEY (id)
);
END;

--

BEGIN;
CREATE TABLE IF NOT EXISTS "Project_Tag"(
	id serial,
	pid serial NOT NULL,
	tid serial NOT NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (pid)
		REFERENCES "Project" (pid)
		ON DELETE CASCADE
		ON UPDATE CASCADE,
	FOREIGN KEY (tid)
		REFERENCES "Tag" (id)
		ON DELETE CASCADE
		ON UPDATE CASCADE
);
END;

--

BEGIN;
CREATE TABLE IF NOT EXISTS "Gallery"(
	id serial,
	pid serial NOT NULL,
	published timestamp DEFAULT NOW(),
	likes int,

	PRIMARY KEY (id),
	FOREIGN KEY (pid)
		REFERENCES "Project" (pid)
		ON DELETE CASCADE
		ON UPDATE CASCADE
);
END;
