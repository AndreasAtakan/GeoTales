/**/

BEGIN;
INSERT INTO "User" (uid)
VALUES (1);
END;

--

BEGIN;
INSERT INTO "Project" (title, description)
VALUES ('main', 'main project');
END;

--

BEGIN;
INSERT INTO "User_Project" (uid, pid, status)
VALUES ( (SELECT uid FROM "User" LIMIT 1), (SELECT pid FROM "Project" LIMIT 1), 'owner' );
END;
