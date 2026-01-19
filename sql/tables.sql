DROP DATABASE IF EXISTS TimeSight;
CREATE DATABASE IF NOT EXISTS TimeSight;
USE TimeSight;

DROP TABLE IF EXISTS User;
CREATE TABLE User
(
    pk_user_id INT PRIMARY KEY AUTO_INCREMENT,
    username   VARCHAR(30)  NOT NULL,
    passwort   varchar(256) NOT NULL
);

DROP TABLE IF EXISTS Gruppe;
CREATE TABLE Gruppe
(
    pk_group_id INT PRIMARY KEY AUTO_INCREMENT,
    gruppenname VARCHAR(30) NOT NULL,
    invite_code VARCHAR(8)  NOT NULL
);

DROP TABLE IF EXISTS Termin;
CREATE TABLE Termin
(
    pk_termin_id    INT PRIMARY KEY AUTO_INCREMENT,
    bezeichnung     VARCHAR(255) NOT NULL,
    beschreibung    VARCHAR(255),
    datum           DATETIME     NOT NULL,
    fk_group_id     INT          NOT NULL,
    fk_ersteller_id INT          NULL,
    CONSTRAINT termin_group FOREIGN KEY (fk_group_id)
        REFERENCES `Gruppe` (pk_group_id),
    CONSTRAINT termin_user FOREIGN KEY (fk_ersteller_id)
        REFERENCES `User` (pk_user_id)
);

DROP TABLE IF EXISTS Termin_User;
CREATE TABLE Termin_User
(
    ist_erledigt BOOLEAN,
    fk_termin_id INT,
    fk_user_id   INT,
    PRIMARY KEY (fk_termin_id, fk_user_id),
    CONSTRAINT termin_user_termin FOREIGN KEY (fk_termin_id)
        REFERENCES Termin (pk_termin_id),
    CONSTRAINT termin_user_user FOREIGN KEY (fk_user_id)
        REFERENCES User (pk_user_id)
);

DROP TABLE IF EXISTS Gruppe_User;
CREATE TABLE Gruppe_User
(
    markierungsfarbe VARCHAR(7),
    ist_admin        BOOLEAN,
    kann_bearbeiten  BOOLEAN,
    kann_loeschen    BOOLEAN,
    fk_group_id      INT NOT NULL,
    fk_user_id       INT NOT NULL,
    PRIMARY KEY (fk_group_id, fk_user_id),
    CONSTRAINT gruppe_user_group FOREIGN KEY (fk_group_id)
        REFERENCES `Gruppe` (pk_group_id),
    CONSTRAINT gruppe_user_user FOREIGN KEY (fk_user_id)
        REFERENCES `User` (pk_user_id)
);

DROP TABLE IF EXISTS Beitritt_Anfrage;
CREATE TABLE Beitritt_Anfrage
(
    pk_anfrage_id INT PRIMARY KEY AUTO_INCREMENT,
    fk_user_id    INT NOT NULL,
    fk_group_id   INT NOT NULL,
    CONSTRAINT beitritt_anfrage_group FOREIGN KEY (fk_group_id)
        REFERENCES `Gruppe` (pk_group_id),
    CONSTRAINT beitritt_anfrage_user FOREIGN KEY (fk_user_id)
        REFERENCES `User` (pk_user_id)
);

DROP TABLE IF EXISTS Ban;
CREATE TABLE Ban
(

    pk_ban_id   INT PRIMARY KEY AUTO_INCREMENT,
    fk_user_id  INT NOT NULL,
    fk_group_id INT NOT NULL,
    CONSTRAINT ban_group FOREIGN KEY (fk_group_id)
        REFERENCES `Gruppe` (pk_group_id),
    CONSTRAINT ban_user FOREIGN KEY (fk_user_id)
        REFERENCES `User` (pk_user_id)

);

INSERT INTO User
VALUES (null, 'TvT', SHA2('secret', 256));
INSERT INTO User
VALUES (null, 'Timmy', Sha2('1234', 256));
INSERT INTO User
VALUES (null, 'IchBinBoese', SHA2('>:(', 256));
INSERT INTO User
VALUES (null, 'Felix', SHA2('passwort(smmkp!)', 256));
INSERT INTO Gruppe
VALUES (null, 'Beste Gruppe', 'WASDWASD');
INSERT INTO Gruppe
VALUES (null, 'Zweitbeste Gruppe', 'AAAABBBB');
INSERT INTO Gruppe_User
VALUES (null, true, true, true, 1, 1);
INSERT INTO Gruppe_User
VALUES (null, false, true, true, 2, 2);
INSERT INTO Gruppe_User
VALUES (null, true, false, false, 2, 1);
INSERT INTO Ban
VALUES (null, 3, 1);
INSERT Termin
VALUES (null, 'Mathe HÜ', 'Wahrscheinlichkeitsrechnung', '2026-04-12 23:59:59', 1, 1);
INSERT Termin
VALUES (null, 'ITPÜ Vorpräsentation', 'Das wird lustig ._.', '2026-01-13 10:10:10', 1, 1);
INSERT Termin_User
VALUES (false, 1, 1);
INSERT Termin_User
VALUES (false, 1, 2);
INSERT Termin_User
VALUES (false, 2, 1);
INSERT Termin_User
VALUES (false, 2, 2);