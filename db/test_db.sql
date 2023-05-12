-- MySQL dump 10.13  Distrib 8.0.20, for Win64 (x86_64)
--
-- Host: localhost    Database: mturk_sg
-- ------------------------------------------------------
-- Server version	8.0.20

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `annotation`
--

DROP TABLE IF EXISTS `annotation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `annotation` (
  `annotationid` int NOT NULL,
  `turkid` int DEFAULT NULL,
  `oid` int DEFAULT NULL,
  `frameid` int DEFAULT NULL,
  `annotation_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`annotationid`),
  KEY `frameid` (`frameid`),
  KEY `turkid` (`turkid`),
  KEY `oid` (`oid`),
  CONSTRAINT `annotation_ibfk_1` FOREIGN KEY (`frameid`) REFERENCES `frame` (`frameid`),
  CONSTRAINT `annotation_ibfk_2` FOREIGN KEY (`turkid`) REFERENCES `turk` (`turkid`),
  CONSTRAINT `annotation_ibfk_3` FOREIGN KEY (`oid`) REFERENCES `observation` (`oid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `annotation`
--

LOCK TABLES `annotation` WRITE;
/*!40000 ALTER TABLE `annotation` DISABLE KEYS */;
/*!40000 ALTER TABLE `annotation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `frame`
--

DROP TABLE IF EXISTS `frame`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `frame` (
  `frameid` int NOT NULL,
  `frame_name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`frameid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `frame`
--

LOCK TABLES `frame` WRITE;
/*!40000 ALTER TABLE `frame` DISABLE KEYS */;
/*!40000 ALTER TABLE `frame` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hit`
--

DROP TABLE IF EXISTS `hit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hit` (
  `hitid` int NOT NULL,
  `max_observations` int DEFAULT NULL,
  `creation_date` date DEFAULT NULL,
  PRIMARY KEY (`hitid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hit`
--

LOCK TABLES `hit` WRITE;
/*!40000 ALTER TABLE `hit` DISABLE KEYS */;
INSERT INTO `hit` VALUES (1,10,'2020-12-29');
/*!40000 ALTER TABLE `hit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `observation`
--

DROP TABLE IF EXISTS `observation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `observation` (
  `oid` int NOT NULL,
  `main_text` varchar(250) DEFAULT NULL,
  `in_response_text` varchar(250) DEFAULT NULL,
  `hitid` int DEFAULT NULL,
  PRIMARY KEY (`oid`),
  KEY `hitid` (`hitid`),
  CONSTRAINT `observation_ibfk_1` FOREIGN KEY (`hitid`) REFERENCES `hit` (`hitid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `observation`
--

LOCK TABLES `observation` WRITE;
/*!40000 ALTER TABLE `observation` DISABLE KEYS */;
INSERT INTO `observation` VALUES (1,'this is sample 1','it is a response to this msg',1),(2,'this is sample 2',NULL,1),(3,'this is sample 3',NULL,1),(4,'this is sample 4',NULL,1),(5,'this is sample 5','it is a response to this msg',1);
/*!40000 ALTER TABLE `observation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `turk`
--

DROP TABLE IF EXISTS `turk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `turk` (
  `turkid` int NOT NULL,
  `amazon_turkid` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`turkid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `turk`
--

LOCK TABLES `turk` WRITE;
/*!40000 ALTER TABLE `turk` DISABLE KEYS */;
/*!40000 ALTER TABLE `turk` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-12-30 13:26:53
