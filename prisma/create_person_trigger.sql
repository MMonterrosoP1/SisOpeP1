DELIMITER //

DROP TRIGGER IF EXISTS after_person_update //

CREATE TRIGGER after_person_update
AFTER UPDATE ON person
FOR EACH ROW
BEGIN
    IF NEW.givenNames != OLD.givenNames OR NEW.familyNames != OLD.familyNames THEN
        UPDATE user 
        SET name = CONCAT(NEW.givenNames, ' ', NEW.familyNames)
        WHERE personId = NEW.id;
    END IF;
END //

DROP TRIGGER IF EXISTS after_person_insert //

CREATE TRIGGER after_person_insert
AFTER INSERT ON person
FOR EACH ROW
BEGIN
    UPDATE user 
    SET name = CONCAT(NEW.givenNames, ' ', NEW.familyNames)
    WHERE personId = NEW.id;
END //

DELIMITER ;
