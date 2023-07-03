DELIMITER //
DROP PROCEDURE IF EXISTS make_seq_hit_replica //
CREATE PROCEDURE make_seq_hit_replica(n INT, lower_bound INT, upper_bound INT, replicas INT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE n_sid INT;
    DECLARE old_hitid INT;
    DECLARE new_hitid INT;
    DECLARE cntr INT;
    DECLARE rnk INT;
    DECLARE last_replicaid INT;
    DECLARE new_replicaid INT;
    DECLARE get_last_replicaid CURSOR FOR SELECT MAX(replicaid) FROM assignment;
    DECLARE available_sentences_cur CURSOR FOR SELECT t.sid FROM sentence s, token t
        WHERE t.sid = s.sid AND t.sid NOT IN (SELECT DISTINCT sid FROM assignment)
        GROUP BY t.sid
        HAVING COUNT(*) BETWEEN lower_bound AND upper_bound
        ORDER BY t.sid LIMIT n; 
    DECLARE subsequent_sentences CURSOR FOR SELECT DISTINCT sid FROM assignment WHERE hitid = old_hitid; 
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    OPEN get_last_replicaid;
    get_replicaid_loop: LOOP
		FETCH get_last_replicaid INTO last_replicaid;
        IF done THEN
			SET done = FALSE;
			LEAVE get_replicaid_loop;
		END IF;
    END LOOP;
    CLOSE get_last_replicaid;
    IF last_replicaid IS NULL THEN
		SET new_replicaid = 1;
	ELSE
		SET new_replicaid = last_replicaid + 1;
	END IF;
    
    SET cntr = 0;
    OPEN available_sentences_cur;
    replica_loop: LOOP
        SET rnk = 0;
        IF cntr < replicas THEN
            INSERT INTO hit (max_observations, creation_date) VALUES (n, curdate());
            SET new_hitid = LAST_INSERT_ID();
            SELECT new_hitid;
            
            IF cntr > 0 THEN
				OPEN subsequent_sentences;
                subsequent_loop: LOOP
                    FETCH subsequent_sentences INTO n_sid;
                    IF done THEN
                        SET done = FALSE;
                        CLOSE subsequent_sentences;
                        LEAVE subsequent_loop;
                        
                    END IF;
                    SET rnk = rnk + 1;
                    INSERT INTO assignment (hitid, sid, create_date, rank_value, replicaid) VALUES (new_hitid, n_sid, curdate(), rnk, new_replicaid);
				END LOOP;
            ELSE
				SET old_hitid = new_hitid;
                assignment_loop: LOOP
                    FETCH available_sentences_cur INTO n_sid;
                    IF done THEN
                        SET done = FALSE;
                        LEAVE assignment_loop;
                    END IF;
                    SET rnk = rnk + 1;
                    INSERT INTO assignment (hitid, sid, create_date, rank_value, replicaid) VALUES (new_hitid, n_sid, curdate(), rnk, new_replicaid);
                END LOOP;
            END IF;
        ELSE
            LEAVE replica_loop;
        END IF;
        SET cntr = cntr+1;
        
    END LOOP;
    CLOSE available_sentences_cur;
    
END //
DELIMITER ;