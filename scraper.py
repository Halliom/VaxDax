import requests
from bs4 import BeautifulSoup

class Scraper:

    def __init__(self):
        self.URL = "https://www.folkhalsomyndigheten.se/smittskydd-beredskap/utbrott/aktuella-utbrott/covid-19/vaccination-mot-covid-19/statistik/statistik-over-registrerade-vaccinationer-covid-19/"
        
    def perform_request(self):
        self.page = requests.get(self.URL)

        self.soup = BeautifulSoup(self.page.content, "html.parser")

    def parse_table(self):
        captions = self.soup.find_all("table")
        
        if len(captions) < 2:
            # TODO: Error handling
            pass
        
        table2 = captions[1].find("tbody")
        if not table2:
            # TODO: Error handling
            pass

        result = []
        for row in table2.find_all("tr"):            
            data = row.find_all("td")
            if len(data) != 5:
                continue

            result.append({
                "date": data[0].text,
                "total_1_dose": int(data[1].text.replace(" ", "")),
                "total_1_dose_percent": float(data[2].text.replace(",", ".")), 
                "total_2_dose": int(data[3].text.replace(" ", "")), 
                "total_2_dose_percent": float(data[4].text.replace(",", "."))
            })
        return result