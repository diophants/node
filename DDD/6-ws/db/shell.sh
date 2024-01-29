psql -f install.sql -U postgres
PGPASSWORD=diophant psql -d example -f structure.sql -U diophant
PGPASSWORD=diophant psql -d example -f data.sql -U diophant