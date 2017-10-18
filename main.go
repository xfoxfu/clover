package main

import (
	"log"

	"github.com/gin-gonic/gin"

	_ "github.com/jinzhu/gorm/dialects/sqlite"

	"github.com/joho/godotenv"

	"github.com/coderfox/clover/routes"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Disable Console Color
	// gin.DisableConsoleColor()

	// Creates a gin router with default middleware:
	// logger and recovery (crash-free) middleware
	router := gin.Default()

	routes.User(router)

	router.Run()
}
