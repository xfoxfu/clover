package main

import (
	"log"
	"os"

	"github.com/coderfox/clover/models"
	"github.com/coderfox/clover/routes"
	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
		panic(err)
	}

	db, err := gorm.Open("sqlite3", os.Getenv("DATABASE_PATH"))
	if err != nil {
		log.Fatal("Error connecting to database: " + os.Getenv("DATABASE_PATH") + err.Error())
		panic(err)
	}
	defer db.Close()
	db.AutoMigrate(&models.User{})
	defer db.Close()

	// Disable Console Color
	// gin.DisableConsoleColor()

	// Creates a gin router with default middleware:
	// logger and recovery (crash-free) middleware
	router := gin.Default()

	routes.User(db, router)

	router.Run()
}
