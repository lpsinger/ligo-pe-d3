#!/usr/bin/env python
from __future__ import print_function

import glue.ligolw.ilwd
import sqlite3
import json
import numpy as np

with sqlite3.connect('H1L1V1-ALL_LLOID_1_injections-966383960-5230905.sqlite') as db:
    db.row_factory = sqlite3.Row
    if False:
        with open("coinc_inspiral.json", "w") as jsonfile:
            json.dump([
                {
                    'coinc_event_id':
                        int(glue.ligolw.ilwd.ilwdchar(row['coinc_event_id'])),
                    'far':
                        row['combined_far'],
                    'snr':
                        row['snr'],
                    'mass':
                        row['mass'],
                    'mchirp':
                        row['mchirp']
                }
                for row in db.execute("SELECT * FROM coinc_inspiral")],
            jsonfile)
    else:
        db.execute("CREATE TEMPORARY TABLE sky_map_coincs (coinc_event_id TEXT NOT NULL)")
        for row in np.recfromtxt("toa_snr.csv", delimiter=',', names=True):
            db.execute("INSERT INTO sky_map_coincs VALUES (?)", (row['coinc_event_id'],))
        with open("coinc_inspiral.csv", "w") as csvfile:
            print('coinc_event_id', 'far', 'snr', 'mass', 'mchirp',
                sep=',', file=csvfile)
            for row in db.execute("SELECT * FROM coinc_inspiral INNER JOIN sky_map_coincs USING (coinc_event_id)"):
                print(int(glue.ligolw.ilwd.ilwdchar(row['coinc_event_id'])),
                    row['combined_far'], row['snr'], row['mass'], row['mchirp'],
                    sep=',', file=csvfile)
        db.execute("CREATE TEMPORARY TABLE sky_map_sims (simulation_id TEXT NOT NULL)")
        for row in np.recfromtxt("toa_snr.csv", delimiter=',', names=True):
            db.execute("INSERT INTO sky_map_sims VALUES (?)", (row['simulation_id'],))
        with open("sim_inspiral.csv", "w") as csvfile:
            print('simulation_id', 'mass', 'mchirp', 'distance',
                sep=',', file=csvfile)
            for row in db.execute("SELECT * FROM sim_inspiral INNER JOIN sky_map_sims USING (simulation_id)"):
                print(int(glue.ligolw.ilwd.ilwdchar(row['simulation_id'])),
                    row['mass1'] + row['mass2'], row['mchirp'], row['distance'],
                    sep=',', file=csvfile)
