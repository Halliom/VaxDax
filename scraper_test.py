from re import T
import unittest

from scraper import Scraper

class TestScraper(unittest.TestCase):

    def test_performs_request_without_exceptions(self):
        scraper = Scraper()
        
        try:
            scraper.perform_request()
        except:
            self.fail("Scraper raised an exception while performing request")
    
    def test_parses_table_without_exceptions(self):
        scraper = Scraper()
        
        try:
            scraper.perform_request()
            scraper.parse_table()
        except:
            self.fail("Scraper raised an exception while parsing table")
        
    def test_table_has_correct_date_format(self):
        scraper = Scraper()
        scraper.perform_request()
        table = scraper.parse_table()

        for entry in table:
            self.assertIn("date", entry)
            self.assertEqual(entry["date"].strip(), entry["date"])
            
            split_date = entry["date"].split("-")
            self.assertEqual(len(split_date), 3)
            self.assertEqual(len(split_date[0]), 4)
            self.assertTrue(split_date[0].isnumeric())
            self.assertEqual(len(split_date[1]), 2)
            self.assertTrue(split_date[1].isnumeric())
            self.assertEqual(len(split_date[2]), 2)
            self.assertTrue(split_date[2].isnumeric())

    def test_table_has_correct_vaccinated_format(self):
        scraper = Scraper()
        scraper.perform_request()
        table = scraper.parse_table()

        for entry in table:
            self.assertIn("vaccinated", entry)
            self.assertEqual(type(entry["vaccinated"]), int)

if __name__ == "__main__":
    unittest.main()