package models

import (
	"math/rand"

	"github.com/jinzhu/gorm"
	"golang.org/x/crypto/bcrypt"
)

// User ...
type User struct {
	gorm.Model
	Email           string `gorm:"size:100;unique;not null"`
	Note            string `gorm:"type:text"`
	hashedPassword  string
	SsPassword      string `gorm:"not null"`
	SsPort          int    `gorm:"unique;not null"`
	SsEncryption    string `gorm:"default:'chacha20-ietf-poly1305'"`
	IsAdmin         bool   `gorm:"default:false"`
	IsEmailVerified bool   `gorm:"default:true"`
	Enabled         bool   `gorm:"default:true"`
	BandwidthUsed   int    `gorm:"default:0"`
}

// SetPassword ...
func (u User) SetPassword(password string) error {
	bytePassword := []byte(password)
	cost, err := bcrypt.Cost(bytePassword)
	if err != nil {
		return err
	}
	hashedPassword, err := bcrypt.GenerateFromPassword(bytePassword, cost)
	if err != nil {
		return err
	}
	u.hashedPassword = string(hashedPassword)
	return nil
}

// CheckPassword ...
func (u User) CheckPassword(input string) bool {
	byteInput := []byte(input)
	err := bcrypt.CompareHashAndPassword([]byte(u.hashedPassword), byteInput)
	if err != nil {
		return false
	}
	return true
}

// GenerateAndSetSsPassword ...
func (u User) GenerateAndSetSsPassword() string {
	const length = 8
	const charset = "abcdefghijkmnpqrstuvwxyzACDEFGHJKLMNPQRSTUVWXYZ2345679"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}

// AllocateAndSetSsPort ...
func (u User) AllocateAndSetSsPort(db *gorm.DB) error {

}
