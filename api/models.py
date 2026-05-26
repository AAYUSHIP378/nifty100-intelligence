from django.db import models


class FactMlScores(models.Model):
    symbol = models.TextField(blank=True, null=True)
    company_name = models.TextField(blank=True, null=True)
    sector = models.TextField(blank=True, null=True)

    sales = models.FloatField(blank=True, null=True)
    net_profit = models.FloatField(blank=True, null=True)
    operating_profit = models.FloatField(blank=True, null=True)

    opm_percentage = models.FloatField(blank=True, null=True)
    debt_to_equity = models.FloatField(blank=True, null=True)

    overall_score = models.FloatField(blank=True, null=True)
    health_label = models.TextField(blank=True, null=True)

    fiscal_year = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'fact_ml_scores'