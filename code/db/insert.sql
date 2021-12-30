/**/

BEGIN;
INSERT INTO "User" (uid, username)
VALUES (1, 'andreas');
END;

--

BEGIN;
INSERT INTO "Project" (title, description, data)
VALUES ('main', 'main project', '{}');
END;

--

BEGIN;
INSERT INTO "User_Project" (uid, pid, status)
VALUES ( (SELECT uid FROM "User" LIMIT 1), (SELECT pid FROM "Project" LIMIT 1), 'owner' );
END;

--

BEGIN;
INSERT INTO "Public" (pid, url)
VALUES ( (SELECT pid FROM "Project" LIMIT 1), 'https://forum.tellusmap.com/t/about-the-public-maps-category/16' );
END;
