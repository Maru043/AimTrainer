package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	_ "github.com/lib/pq"
)

type record struct {
	Id       int
	UserName string  `json:"name"`
	Score    int     `json:"score"`
	Accuracy float64 `json:",string"`
}

type recordSlice struct {
	Records []record
}

var Db *sql.DB

func init() {
	var err error
	Db, err = sql.Open("postgres", "user=aimtrainer dbname=aimtrainer password=0530")
	if err != nil {
		panic(err)
	}
}

func main() {
	server := http.Server{
		Addr: ":8080",
	}
	http.Handle("/challenge/", http.StripPrefix("/challenge/", http.FileServer(http.Dir("Challenge"))))
	http.HandleFunc("/challenge/submit/", putRecord)
	http.HandleFunc("/challenge/getRanking/", getRecords)
	http.Handle("/training/", http.StripPrefix("/training/", http.FileServer(http.Dir("Training"))))
	err := server.ListenAndServe()
	if err != nil {
		log.Println(err)
	}
}

func parseRequest(r *http.Request) record {
	body := r.Body
	defer body.Close()

	buf := new(bytes.Buffer)
	io.Copy(buf, body)

	var rec record
	json.Unmarshal(buf.Bytes(), &rec)

	if rec.UserName == "" {
		rec.UserName = "anonymous"
	}
	return rec
}

func putRecord(w http.ResponseWriter, r *http.Request) {
	rec := parseRequest(r)
	statement := "insert into records (userName, score, accuracy) values($1, $2, $3) returning id"
	stmt, err := Db.Prepare(statement)
	if err != nil {
		log.Println(err)
		return
	}
	defer stmt.Close()

	err = stmt.QueryRow(rec.UserName, rec.Score, rec.Accuracy).Scan(&rec.Id)
	if err != nil {
		log.Println(err)
		return
	}
	return
}

func getRecords(w http.ResponseWriter, r *http.Request) {
	statement := "select row_number() over (order by score desc) as rank, userName, score, accuracy from records "
	var recs recordSlice
	rows, err := Db.Query(statement)
	if err != nil {
		log.Println(err)
		return
	}
	for rows.Next() {
		rec := record{}
		err = rows.Scan(&rec.Id, &rec.UserName, &rec.Score, &rec.Accuracy)
		if err != nil {
			log.Println(err)
			return
		}
		recs.Records = append(recs.Records, rec)
	}
	data, err := json.Marshal(recs)
	if err != nil {
		log.Println(err)
		return
	}
	fmt.Fprint(w, string(data))
}
