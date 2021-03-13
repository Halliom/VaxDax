import requests
import re
from bs4 import BeautifulSoup

class Scraper:

    def __init__(self):
        self.date_pattern = re.compile(r"[\d]{4}-[\d]{2}-[\d]{2}")
        self.number_replacer = re.compile(r"[\D]")
        self.URL = "https://www.folkhalsomyndigheten.se/smittskydd-beredskap/utbrott/aktuella-utbrott/covid-19/vaccination-mot-covid-19/statistik/statistik-over-registrerade-vaccinationer-covid-19/"
        
    def perform_request(self):
        self.page = requests.get(self.URL)

        self.soup = BeautifulSoup(self.page.content, "html.parser")

    def parse_table(self):
        captions = self.soup.find_all("table")
        
        if len(captions) < 1:
            # TODO: Error handling
            pass
        
        table1 = captions[0].find("tbody")
        if not table1:
            # TODO: Error handling
            pass

        result = []
        for row in table1.find_all("tr"):            
            data = row.find_all("td")
            if len(data) != 2:
                continue

            date_match = self.date_pattern.search(data[0].text.strip())
            number_string = self.number_replacer.sub("", data[1].text)
            result.append({
                "date": date_match.group(),
                "vaccinated": int(number_string)
                # "total_1_dose_percent": float(data[2].text.replace(",", ".")), 
                # "total_2_dose": int(data[3].text.replace(" ", "")), 
                # "total_2_dose_percent": float(data[4].text.replace(",", "."))
            })
        return result

if __name__ == "__main__":
    scraper = Scraper()
    scraper.perform_request()
    print(scraper.parse_table())