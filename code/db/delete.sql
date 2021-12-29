/**/

BEGIN;

DELETE FROM "User";
DELETE FROM "Project";
DELETE FROM "User_Project";
DELETE FROM "Tag";
DELETE FROM "Project_Tag";
DELETE FROM "Gallery";

END;
