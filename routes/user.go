package routes

import (
	"net/http"

	"github.com/coderfox/clover/models"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
)

// User applies routes relating to user to a gin engine
func User(db *gorm.DB, router *gin.Engine) {
	router.GET("/users", func(c *gin.Context) {
		var users []models.User
		db.Find(&users)
		if db.Error != nil {
			c.JSON(http.StatusInternalServerError, &gin.H{"message": db.Error})
		} else {
			c.JSON(http.StatusOK, &users)
		}
	})
}
